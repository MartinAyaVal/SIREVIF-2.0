const express = require('express');
const cors = require('cors');
const sequelize = require('./db/config.js');
const tipoVictimaRoutes = require('./routes/tipoVictimaRoutes.js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/tipoVictima', tipoVictimaRoutes);

sequelize.sync({ alter: true })
  .then(() => {
    console.log('🗄  Base de datos sincronizada');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Servicio de tipo de victimas corriendo en el puerto ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('❌ Error al conectar con la base de datos:', err));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'tipoVictima-service', 
    timestamp: new Date().toISOString()
  });
});