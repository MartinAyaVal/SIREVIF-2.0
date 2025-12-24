const express = require('express');
const cors = require('cors');
const gatewayRouter = require('./routes/gatewayRoutes.js');

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
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-documento', 'x-user-rol']
}));

// Parsear JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== RUTAS DEL GATEWAY =====
app.use('/', gatewayRouter);

// ===== MANEJO DE ERRORES DE JSON =====
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('❌ Gateway: Error de JSON mal formado:', err.message);
        return res.status(400).json({
            success: false,
            error: 'JSON mal formado',
            message: 'El cuerpo de la solicitud no es un JSON válido'
        });
    }
    next(err);
});

// ===== RUTA DE FALLBACK =====
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        message: `La ruta ${req.originalUrl} no existe en el gateway`,
        availableRoutes: [
            'POST /usuarios/auth/login',
            'GET /usuarios (requiere token)',
            'POST /usuarios (requiere token)',
            'GET /medidas (requiere token)',
            'POST /medidas (requiere token)',
            'GET /health',
            'GET /usuarios/health',
            'GET /medidas/health'
        ]
    });
});

// ===== INICIAR GATEWAY =====
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log("\n" + "=".repeat(70));
    console.log(`🚀 GATEWAY CENTRAL corriendo en: http://localhost:${PORT}`);
    console.log("=".repeat(70));
    console.log("📋 ENDPOINTS DISPONIBLES:");
    console.log("\n🔐 AUTENTICACIÓN (público):");
    console.log(`   POST http://localhost:${PORT}/usuarios/auth/login`);
    
    console.log("\n👥 GESTIÓN DE USUARIOS (requiere token):");
    console.log(`   GET    http://localhost:${PORT}/usuarios`);
    console.log(`   POST   http://localhost:${PORT}/usuarios`);
    console.log(`   GET    http://localhost:${PORT}/usuarios/:id`);
    console.log(`   PUT    http://localhost:${PORT}/usuarios/:id`);
    console.log(`   DELETE http://localhost:${PORT}/usuarios/:id`);
    console.log(`   PATCH  http://localhost:${PORT}/usuarios/:id/estado`);
    
    console.log("\n🛡️  MEDIDAS DE PROTECCIÓN (requiere token):");
    console.log(`   GET    http://localhost:${PORT}/medidas`);
    console.log(`   POST   http://localhost:${PORT}/medidas`);
    console.log(`   GET    http://localhost:${PORT}/medidas/:id`);
    console.log(`   PUT    http://localhost:${PORT}/medidas/:id`);
    console.log(`   DELETE http://localhost:${PORT}/medidas/:id`);
    
    console.log("\n❤️  HEALTH CHECKS (públicos):");
    console.log(`   Gateway:    GET http://localhost:${PORT}/health`);
    console.log(`   Usuarios:   GET http://localhost:${PORT}/usuarios/health`);
    console.log(`   Medidas:    GET http://localhost:${PORT}/medidas/health`);
    
    console.log("\n🔧 SERVICIOS BACKEND:");
    console.log(`   Usuarios:   http://localhost:3005`);
    console.log(`   Medidas:    http://localhost:3006 (ajusta si es diferente)`);
    console.log("=".repeat(70));
    console.log("💡 Nota: Usa POST /usuarios/auth/login para obtener token JWT");
    console.log("=".repeat(70) + "\n");
});