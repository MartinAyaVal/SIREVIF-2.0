const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

// ===== CONFIGURACIÓN DE SERVICIOS =====
const serviciosConfig = {
    usuarios: {
        url: 'http://localhost:3005',
        pathRewrite: {
            '^/usuarios': '/',
            '^/usuarios/auth': '/auth'
        }
    },
    medidas: {
        url: 'http://localhost:3006',
        pathRewrite: {
            '^/medidas': '/'
        }
    }
};

// ===== MIDDLEWARE PARA LOGS =====
router.use((req, res, next) => {
    console.log(`[Gateway] 📥 ${req.method} ${req.originalUrl}`);
    console.log(`[Gateway] 📥 Origin: ${req.headers.origin}`);
    console.log(`[Gateway] 📥 Content-Type: ${req.headers['content-type']}`);
    next();
});

// ===== RUTAS PÚBLICAS (sin autenticación) =====

// 1. Login - Ruta pública (MEJORADA)
const loginProxy = createProxyMiddleware({
    target: serviciosConfig.usuarios.url,
    changeOrigin: true,
    pathRewrite: {
        '^/usuarios/auth/login': '/auth/login'
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Gateway] 🔐 Proxying login: ${req.method} ${req.originalUrl}`);
        
        if (req.body) {
            const bodyData = JSON.stringify(req.body);
            console.log(`[Gateway] 🔐 Body a enviar:`, JSON.stringify(req.body, null, 2));
            
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            
            // Escribir el body
            proxyReq.write(bodyData);
            proxyReq.end();
        } else {
            console.log(`[Gateway] ⚠️ No hay body en la request`);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[Gateway] 🔐 Respuesta del servicio usuarios: ${proxyRes.statusCode}`);
        
        // Modificar headers de respuesta si es necesario
        proxyRes.headers['access-control-allow-origin'] = req.headers.origin || '*';
        proxyRes.headers['access-control-allow-credentials'] = 'true';
    },
    onError: (err, req, res) => {
        console.error(`[Gateway] ❌ Error en proxy login:`, err.message);
        
        // Si hay error de conexión con el servicio
        if (err.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                error: 'Servicio no disponible',
                message: 'El servicio de usuarios no está respondiendo. Verifica que esté corriendo en puerto 3005.'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Error de gateway',
            message: err.message || 'Error desconocido'
        });
    },
    proxyTimeout: 30000, // 30 segundos
    timeout: 30000
});

router.post('/usuarios/auth/login', loginProxy);

// 2. Health checks - Rutas públicas (CORREGIDAS)
router.get('/usuarios/health', 
    createProxyMiddleware({
        target: serviciosConfig.usuarios.url,
        changeOrigin: true,
        pathRewrite: {
            '^/usuarios/health': '/health',
            '^/usuarios': '/'
        },
        onError: (err, req, res) => {
            console.error(`[Gateway] ❌ Error health usuarios:`, err.message);
            res.status(503).json({
                service: 'usuarios-service',
                status: 'DOWN',
                error: err.message,
                timestamp: new Date().toISOString()
            });
        }
    })
);

router.get('/medidas/health', 
    createProxyMiddleware({
        target: serviciosConfig.medidas.url,
        changeOrigin: true,
        pathRewrite: {
            '^/medidas/health': '/health',
            '^/medidas': '/'
        },
        onError: (err, req, res) => {
            console.error(`[Gateway] ❌ Error health medidas:`, err.message);
            res.status(503).json({
                service: 'medidas-service',
                status: 'DOWN',
                error: err.message,
                timestamp: new Date().toISOString()
            });
        }
    })
);

// ===== RUTAS PROTEGIDAS DE USUARIOS =====
// Todas las rutas de usuarios (excepto login y health) requieren autenticación
router.use('/usuarios', authMiddleware.autenticarToken);

// Proxy para CRUD de usuarios (excluyendo login y health)
router.use('/usuarios', 
    createProxyMiddleware({
        target: serviciosConfig.usuarios.url,
        changeOrigin: true,
        pathRewrite: {
            '^/usuarios': '/'
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log(`[Gateway] 👥 Usuarios: ${req.method} ${req.originalUrl}`);
            
            // DEPURACIÓN SOLO PARA PUT (actualizaciones)
            if (req.method === 'PUT' && req.body) {
                console.log('[Gateway] 📦 Body para actualizar usuario:');
                console.log(JSON.stringify(req.body, null, 2));
            }
            
            // Pasar información del usuario autenticado
            if (req.usuario) {
                proxyReq.setHeader('X-User-ID', req.usuario.id || '');
                proxyReq.setHeader('X-User-Documento', req.usuario.documento || '');
                proxyReq.setHeader('X-User-Rol', req.usuario.rolId || '');
                proxyReq.setHeader('X-User-Nombre', req.usuario.nombre || '');
            }
            
            // Asegurar que el body se envíe correctamente
            if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
                proxyReq.end();
            }
        },
        onError: (err, req, res) => {
            console.error(`[Gateway] ❌ Error proxy usuarios:`, err.message);
            res.status(500).json({
                success: false,
                error: 'Error de conexión con servicio de usuarios',
                message: err.message,
                timestamp: new Date().toISOString()
            });
        }
    })
);

// ===== RUTAS PROTEGIDAS DE MEDIDAS DE PROTECCIÓN =====
// Todas las rutas de medidas requieren autenticación
router.use('/medidas', authMiddleware.autenticarToken);

// Proxy para CRUD de medidas
router.use('/medidas', 
    createProxyMiddleware({
        target: serviciosConfig.medidas.url,
        changeOrigin: true,
        pathRewrite: {
            '^/medidas': '/'
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log(`[Gateway] 🛡️  Medidas: ${req.method} ${req.originalUrl}`);
            
            // Pasar información del usuario autenticado
            if (req.usuario) {
                proxyReq.setHeader('X-User-ID', req.usuario.id || '');
                proxyReq.setHeader('X-User-Documento', req.usuario.documento || '');
                proxyReq.setHeader('X-User-Rol', req.usuario.rolId || '');
                proxyReq.setHeader('X-User-Comisaria', req.usuario.comisariaId || 0);
            }
            
            // Asegurar que el body se envíe correctamente
            if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
                proxyReq.end();
            }
        },
        onError: (err, req, res) => {
            console.error(`[Gateway] ❌ Error proxy medidas:`, err.message);
            res.status(500).json({
                success: false,
                error: 'Error de conexión con servicio de medidas',
                message: err.message,
                timestamp: new Date().toISOString()
            });
        }
    })
);

// ===== RUTAS DEL GATEWAY (no requieren proxy) =====

// Health check del gateway
router.get('/health', (req, res) => {
    const servicios = Object.keys(serviciosConfig).map(servicio => ({
        nombre: servicio,
        url: serviciosConfig[servicio].url,
        estado: 'configurado'
    }));
    
    res.json({
        success: true,
        service: 'gateway-service',
        timestamp: new Date().toISOString(),
        port: process.env.PORT || 8080,
        servicios: servicios,
        endpoints: {
            auth: 'POST /usuarios/auth/login',
            usuarios: 'GET /usuarios (requiere token)',
            medidas: 'GET /medidas (requiere token)',
            health: {
                gateway: 'GET /health',
                usuarios: 'GET /usuarios/health',
                medidas: 'GET /medidas/health'
            }
        }
    });
});

// Ruta para test directo
router.post('/test-login', (req, res) => {
    console.log('[Gateway] 🧪 Test directo recibido:', req.body);
    res.json({
        success: true,
        message: 'Gateway funcionando correctamente',
        receivedData: req.body,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;