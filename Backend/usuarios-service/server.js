const express = require('express');
const cors = require('cors');
const sequelize = require('./db/config.js');
const usuariosRoutes = require('./routes/usuariosRoutes.js');
const authRoutes = require('./routes/authRouthes.js');
require('dotenv').config();

const app = express();

// ===== MIDDLEWARE CRÍTICO =====
const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://localhost:3005',
    'http://localhost:3006'
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-documento', 'x-user-rol', 'x-user-nombre', 'x-user-comisaria']
}));

// MIDDLEWARE DE LOGS
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.url}`);
    console.log(`📥 Content-Type: ${req.headers['content-type']}`);
    console.log(`📥 Origin: ${req.headers['origin']}`);
    next();
});

// Parsear JSON y URL-encoded
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
        try {
            if (buf && buf.length > 0) {
                const bodyString = buf.toString();
                if (bodyString.trim().length > 0) {
                    JSON.parse(bodyString);
                }
            }
        } catch (e) {
            console.error('❌ JSON inválido recibido:', buf ? buf.toString() : 'No buffer');
            res.status(400).json({ 
                error: 'JSON inválido',
                message: 'El cuerpo de la solicitud no es un JSON válido'
            });
        }
    }
}));

app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
}));

// ===== RUTAS =====
app.use('/auth', authRoutes);
app.use('/', usuariosRoutes);

// ===== RUTAS DE PRUEBA =====
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'usuarios-service',
    port: process.env.PORT || 3005,
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: 'POST /auth/login',
      usuarios: 'GET /',
      crearUsuario: 'POST /',
      obtenerUsuario: 'GET /:id',
      actualizarUsuario: 'PUT /:id',
      eliminarUsuario: 'DELETE /:id',
      cambiarEstado: 'PATCH /:id/estado'
    }
  });
});

// ===== MANEJO DE ERRORES =====
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('❌ Error de JSON:', err.message);
    return res.status(400).json({ 
      error: 'JSON mal formado',
      message: 'El cuerpo de la solicitud no es un JSON válido'
    });
  }
  
  console.error('❌ Error general:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message || 'Error desconocido'
  });
});

// ===== INICIAR SERVIDOR =====
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conectado a la base de datos MySQL');
    
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('🗄  Modelos sincronizados con la base de datos');
    
    const PORT = process.env.PORT || 3005;
    app.listen(PORT, '0.0.0.0', () => {
      console.log("\n" + "=".repeat(60));
      console.log(`🚀 Servicio de usuarios corriendo en: http://localhost:${PORT}`);
      console.log("=".repeat(60));
      console.log("📋 Endpoints disponibles:");
      console.log(`  🔐 Login:           POST http://localhost:${PORT}/auth/login`);
      console.log(`  👥 Listar usuarios: GET  http://localhost:${PORT}/`);
      console.log(`  ➕ Crear usuario:   POST http://localhost:${PORT}/`);
      console.log(`  👤 Obtener usuario: GET  http://localhost:${PORT}/:id`);
      console.log(`  ✏️  Actualizar:      PUT  http://localhost:${PORT}/:id`);
      console.log(`  🗑️  Eliminar:        DEL  http://localhost:${PORT}/:id`);
      console.log(`  🔄 Cambiar estado:  PATCH http://localhost:${PORT}/:id/estado`);
      console.log(`  ❤️  Health check:    GET  http://localhost:${PORT}/health`);
      console.log("=".repeat(60));
      console.log("💡 Nota: Este servicio es accedido a través del gateway en:");
      console.log(`     POST http://localhost:8080/usuarios/auth/login`);
      console.log("=".repeat(60) + "\n");
    });
  })
  .catch(err => {
    console.error('❌ Error al conectar con la base de datos:', err.message);
    process.exit(1);
  });