const Roles = require('../models/roles.js');

// Obterner todos los Roles registrados
exports.getRol = async (req, res) => {
    try {
        const rol = await Roles.findAll();
        res.json(rol);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener roles', error });
    }
};

// Crear Rol
exports.createRol = async (req, res) => {
  try {
    const rol = req.body.rol;
    
    const nuevo = await Roles.create({ 
      rol: rol, 
    });
    
    res.status(201).json(nuevo);
  } catch (error) {
    console.log('Error al crear rol:', error);
    res.status(500).json({ message: 'Error al crear rol', error });
  }
};

// Obtener rol por medio de Id
exports.getRolById = async (req, res) => {
  try {
    const { id } = req.params;
    const rol = await Roles.findByPk(id);
    if (!rol) return res.status(404).json({ message: 'Rol no encontrado' });
    res.json(rol);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener rol', error });
  }
};

// Actualizar Rol por Id
exports.updateRol = async (req, res) => {
  try {
    const { id } = req.params;
    const rol = req.body.rol;
    
    const nuevo = await Roles.findByPk(id);
    if (!nuevo) return res.status(404).json({ message: 'Tipo de Victima no encontrada' });

    await nuevo.update({ 
      rol:rol
    });
    res.json(nuevo);
  } catch (error) {
    console.log('Error al actualizar Rol:', error);
    res.status(500).json({ message: 'Error al actualizar Rol', error });
  }
};

// Eliminar Rol por Id
exports.deleteRol = async (req, res) => {
  try {
    const { id } = req.params;
    const rol = await Roles.findByPk(id);
    if (!rol) return res.status(404).json({ message: 'Rol no encontrado' });

    await rol.destroy();
    res.json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar Rol', error });
  }
};