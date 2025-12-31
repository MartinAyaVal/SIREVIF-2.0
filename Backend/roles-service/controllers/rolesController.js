const Rol = require('../models/roles.js');

// Obtener todos los Roles registrados
exports.getRol = async (req, res) => {
    try {
        const roles = await Rol.findAll({
            order: [['id', 'ASC']]
        });
        
        res.json(roles);
        
    } catch (error) {
        console.error('Error al obtener roles:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al obtener roles',
            error: error.message 
        });
    }
};

// Crear Rol
exports.createRol = async (req, res) => {
  try {
    const { rol } = req.body;
    
    if (!rol) {
      return res.status(400).json({
        success: false,
        message: 'El campo "rol" es requerido'
      });
    }
    
    const nuevoRol = await Rol.create({ 
      rol: rol 
    });
    
    res.status(201).json(nuevoRol); 
    
  } catch (error) {
    console.error('Error al crear rol:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear rol',
      error: error.message 
    });
  }
};

// Obtener rol por ID
exports.getRolById = async (req, res) => {
  try {
    const { id } = req.params;
    const rol = await Rol.findByPk(id);
    
    if (!rol) {
      return res.status(404).json({ 
        message: 'Rol no encontrado' 
      });
    }
    
    res.json(rol); 
    
  } catch (error) {
    console.error('Error al obtener rol:', error);
    res.status(500).json({ 
      message: 'Error al obtener rol',
      error: error.message 
    });
  }
};

// Actualizar Rol por Id
exports.updateRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;
    
    const rolExistente = await Rol.findByPk(id);
    
    if (!rolExistente) {
      return res.status(404).json({ 
        message: 'Rol no encontrado' 
      });
    }

    await rolExistente.update({ 
      rol: rol 
    });
    
    res.json(rolExistente); 
    
  } catch (error) {
    console.error('Error al actualizar Rol:', error);
    res.status(500).json({ 
      message: 'Error al actualizar Rol',
      error: error.message 
    });
  }
};

// Eliminar Rol por Id
exports.deleteRol = async (req, res) => {
  try {
    const { id } = req.params;
    const rol = await Rol.findByPk(id);
    
    if (!rol) {
      return res.status(404).json({ 
        message: 'Rol no encontrado' 
      });
    }

    await rol.destroy();
    
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar Rol:', error);
    res.status(500).json({ 
      message: 'Error al eliminar Rol',
      error: error.message 
    });
  }
};