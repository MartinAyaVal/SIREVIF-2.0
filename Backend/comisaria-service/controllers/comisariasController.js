const Comisaria = require('../models/comisarias.js');

// Obtener todas las comsiarías registradas
exports.getComisarias = async (req, res) => {
  try {
    const comisarias = await Comisaria.findAll();
    res.json(comisarias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener comisarías', error });
  }
};

// Crear nueva comisaría
exports.createComisaria = async (req, res) => {
  try {
    const numero = req.body.numero;
    const lugar = req.body.lugar;
    
    const comisaria = await Comisaria.create({ 
      numero: numero, 
      lugar: lugar 
    });
    
    res.status(201).json(comisaria);
  } catch (error) {
    console.log('Error al crear comisaría:', error);
    res.status(500).json({ message: 'Error al crear comisaría', error });
  }
};

// Obtener comisaría por ID
exports.getComisariaById = async (req, res) => {
  try {
    const { id } = req.params;
    const comisaria = await Comisaria.findByPk(id);
    if (!comisaria) return res.status(404).json({ message: 'Comisaría no encontrada' });
    res.json(comisaria);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener comisaría', error });
  }
};

// Actualizar comisaría
exports.updateComisaria = async (req, res) => {
  try {
    const { id } = req.params;
    const numero = req.body.numero;
    const lugar = req.body.lugar;
    
    const comisaria = await Comisaria.findByPk(id);
    if (!comisaria) return res.status(404).json({ message: 'Comisaría no encontrada' });

    await comisaria.update({ 
      numero: numero, 
      lugar: lugar 
    });
    res.json(comisaria);
  } catch (error) {
    console.log('Error al actualizar comisaría:', error);
    res.status(500).json({ message: 'Error al actualizar comisaría', error });
  }
};

// Eliminar comisaría
exports.deleteComisaria = async (req, res) => {
  try {
    const { id } = req.params;
    const comisaria = await Comisaria.findByPk(id);
    if (!comisaria) return res.status(404).json({ message: 'Comisaría no encontrada' });

    await comisaria.destroy();
    res.json({ message: 'Comisaría eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar comisaría', error });
  }
};