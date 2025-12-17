// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./db/config.js');
const Medidas = require('./models/Medidas.js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Sincronizar modelos con la base de datos
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Base de datos sincronizada');
  })
  .catch(err => {
    console.error('❌ Error sincronizando BD:', err);
  });

// RUTAS DE LA API

// 1. Obtener todas las medidas
app.get('/api/medidas', async (req, res) => {
  try {
    const medidas = await Medidas.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    
    res.json(medidas);
  } catch (error) {
    console.error('Error obteniendo medidas:', error);
    res.status(500).json({ 
      error: 'Error en el servidor',
      detalle: error.message 
    });
  }
});

// 2. Obtener medidas por comisaría
app.get('/api/medidas/comisaria/:id', async (req, res) => {
  try {
    const comisariaId = req.params.id;
    
    if (isNaN(comisariaId)) {
      return res.status(400).json({ error: 'ID de comisaría inválido' });
    }
    
    const medidas = await Medidas.findAll({
      where: { comisariaId: comisariaId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(medidas);
  } catch (error) {
    console.error('Error obteniendo medidas por comisaría:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// 3. Obtener medidas detalladas
app.get('/api/medidas/detalladas', async (req, res) => {
  try {
    const medidas = await Medidas.findAll({
      include: [],
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    res.json(medidas);
  } catch (error) {
    console.error('Error obteniendo medidas detalladas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// 4. Crear nueva medida
app.post('/api/medidas', async (req, res) => {
  try {
    const nuevaMedida = await Medidas.create(req.body);
    res.status(201).json(nuevaMedida);
  } catch (error) {
    console.error('Error creando medida:', error);
    res.status(500).json({ error: 'Error creando medida' });
  }
});

// 5. Actualizar medida
app.put('/api/medidas/:id', async (req, res) => {
  try {
    const medidaId = req.params.id;
    const [updated] = await Medidas.update(req.body, {
      where: { id: medidaId }
    });
    
    if (updated) {
      const medidaActualizada = await Medidas.findByPk(medidaId);
      res.json(medidaActualizada);
    } else {
      res.status(404).json({ error: 'Medida no encontrada' });
    }
  } catch (error) {
    console.error('Error actualizando medida:', error);
    res.status(500).json({ error: 'Error actualizando medida' });
  }
});

// 6. Eliminar medida
app.delete('/api/medidas/:id', async (req, res) => {
  try {
    const medidaId = req.params.id;
    const deleted = await Medidas.destroy({
      where: { id: medidaId }
    });
    
    if (deleted) {
      res.json({ message: 'Medida eliminada correctamente' });
    } else {
      res.status(404).json({ error: 'Medida no encontrada' });
    }
  } catch (error) {
    console.error('Error eliminando medida:', error);
    res.status(500).json({ error: 'Error eliminando medida' });
  }
});

// Ruta para servir el frontend - SOLUCIÓN ÚNICA
// ELIGE UNA DE ESTAS DOS OPCIONES (NO AMBAS):

// OPCIÓN A: Usando regex (recomendada para SPA)
app.get(/\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// OPCIÓN B: Usando lógica condicional (más explícita)
// app.get('*', (req, res, next) => {
//   if (!req.path.startsWith('/api')) {
//     res.sendFile(path.join(__dirname, '../frontend/index.html'));
//   } else {
//     next(); // Deja que Express maneje rutas API o devuelva 404
//   }
// });

// Configurar puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`📁 API disponible en: http://localhost:${PORT}/api/medidas`);
  
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
  }
});