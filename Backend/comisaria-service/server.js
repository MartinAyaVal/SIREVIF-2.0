const express = require('express');
const cors = require('cors');
const sequelize = require('./db/config.js');
const comisariaRoutes = require('./routes/comisariasRoutes.js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/comisarias', comisariaRoutes);

sequelize.sync({ alter: true })
  .then(() => {
    console.log('🗄  Base de datos sincronizada');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Servicio de comisarías corriendo en el puerto ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('❌ Error al conectar con la base de datos:', err));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'comisarias-service', 
    timestamp: new Date().toISOString()
  });
});