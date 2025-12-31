const { Sequelize } = require('sequelize');
require('dotenv').config();

// Crear la instancia de Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'roles_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, 
  }
);

// Probar la conexión
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a MySQL establecida');
  })
  .catch(err => {
    console.error('❌ Error al conectar a MySQL:', err.message);
  });

// Exportar la instancia directamente
module.exports = sequelize;