const express = require('express');
const cors = require('cors');
const sequelize = require('./db/config.js');
const usuariosRoutes = require('./routes/usuariosRoutes.js');
const authRoutes = require('./routes/authRouthes.js');
require('dotenv').config();

const app = express();

// ===== MIDDLEWARE CRÍTICO =====
// 1. CORS primero
// Añade esta configuración CORS específica:

const allowedOrigins = [
    'http://localhost:8080', // Gateway
    'http://localhost:5500', // Frontend Live Server
    'http://127.0.0.1:5500',
    'http://localhost:3000',
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origen
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`🚫 Servicio Usuarios - Origen bloqueado: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Manejar preflight
app.options('*', cors());

// 2. Parsear JSON - ¡ESTA LÍNEA ES CLAVE!
app.use(express.json());

// 3. Parsear URL-encoded (por si acaso)
app.use(express.urlencoded({ extended: true }));

// ===== RUTAS =====
// Importante: El orden de las rutas SÍ importa
app.use('/usuarios', usuariosRoutes);
app.use('/usuarios/auth', authRoutes);

// ===== RUTAS DE PRUEBA =====
app.get('/', (req, res) => {
  res.json({ 
    message: 'Servicio de Usuarios funcionando',
    endpoints: {
      login: 'POST /usuarios/auth/login',
      usuarios: 'GET /usuarios/',
      health: 'GET /health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'usuarios-service', 
    timestamp: new Date().toISOString()
  });
});

// ===== MANEJO DE ERRORES =====
// Middleware para manejar errores de JSON mal formado
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('❌ Error de JSON:', err.message);
    return res.status(400).json({ 
      error: 'JSON mal formado',
      message: 'El cuerpo de la solicitud no es un JSON válido'
    });
  }
  next(err);
});

// ===== INICIAR SERVIDOR =====
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conectado a la base de datos MySQL');
    
    // Sincronizar modelos
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('🗄  Modelos sincronizados con la base de datos');
    
    const PORT = process.env.PORT || 3005;
    app.listen(PORT, () => {
      console.log(`🚀 Servicio de usuarios corriendo en: http://localhost:${PORT}`);
      console.log(`🔑 Login endpoint: POST http://localhost:${PORT}/usuarios/auth/login`);
      console.log(`👥 Listar usuarios: GET http://localhost:${PORT}/usuarios/`);
    });
  })
  .catch(err => {
    console.error('❌ Error al conectar con la base de datos:', err.message);
    process.exit(1);
  });