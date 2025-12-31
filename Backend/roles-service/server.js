const express = require('express');
const cors = require('cors');
const sequelize = require('./db/config.js');
const rolesRoutes = require('./routes/rolesRoutes.js');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/roles', rolesRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'roles-service', 
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    service: 'Roles Service API',
    version: '1.0.0',
    endpoints: {
      roles: '/roles',
      health: '/health'
    },
    documentation: 'Usa POST /roles para crear un rol, GET /roles para listar todos'
  });
});

// Puerto
const PORT = process.env.PORT || 3003;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync({ alter: true });
    console.log('🗄️  Tablas sincronizadas');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`👥 API Roles: http://localhost:${PORT}/roles`);
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  }
};

// Manejo de cierre limpio
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando conexiones...');
  await sequelize.close();
  console.log('✅ Conexiones cerradas. Adiós!');
  process.exit(0);
});

// Iniciar el servidor
startServer();