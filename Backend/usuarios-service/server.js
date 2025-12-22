const express = require('express');
const cors = require('cors');
const sequelize = require('./db/config.js');
const usuariosRoutes = require('./routes/usuariosRoutes.js');
const authRoutes = require('./routes/authRouthes.js'); // Asegúrate que el nombre es correcto
require('dotenv').config();

const app = express();

// ===== MIDDLEWARE CRÍTICO =====
const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
];

// SOLUCIÓN: Configuración MUY simple - elimina todo lo complejo
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// NO uses app.options() - el middleware cors ya lo maneja

// Parsear JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== RUTAS =====
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