const Victimario = require('../models/victimarios.js');
const sequelize = require('../db/config.js');

// Obtener todos los victimarios registrados
exports.getVictimarios = async (req, res) => {
  try {
    const victimarios = await Victimario.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({
      success: true,
      count: victimarios.length,
      data: victimarios
    });
  } catch (error) {
    console.error('Error en getVictimarios:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener victimarios', 
      error: error.message 
    });
  }
};

// Crear victimario - versión actualizada para formulario
exports.createVictimario = async (req, res) => {
  try {
    console.log('📥 Datos recibidos para crear victimario:', req.body);
    
    const {
      nombreCompleto,
      fechaNacimiento,
      edad,
      tipoDocumento,
      otroTipoDocumento,
      numeroDocumento,
      documentoExpedido,
      sexo,
      lgtbi,
      cualLgtbi,
      otroGeneroIdentificacion,
      estadoCivil,
      direccion,
      barrio,
      ocupacion,
      estudios,
      telefono,
      correo,
      antecedentes,
      comisariaId
    } = req.body;

    // Validación de campos requeridos
    const camposRequeridos = [
      'nombreCompleto', 'fechaNacimiento', 'edad', 'tipoDocumento', 
      'numeroDocumento', 'documentoExpedido', 'sexo', 'estadoCivil',
      'direccion', 'barrio', 'ocupacion', 'estudios'
    ];
    
    for (const campo of camposRequeridos) {
      if (!req.body[campo]) {
        return res.status(400).json({
          success: false,
          message: `El campo '${campo}' es requerido`
        });
      }
    }

    // Crear el victimario
    const victimario = await Victimario.create({
      nombreCompleto,
      fechaNacimiento,
      edad: parseInt(edad) || 0,
      tipoDocumento,
      otroTipoDocumento: otroTipoDocumento || null,
      numeroDocumento: numeroDocumento.toString(),
      documentoExpedido,
      sexo,
      lgtbi: lgtbi || 'NO',
      cualLgtbi: cualLgtbi || null,
      otroGeneroIdentificacion: otroGeneroIdentificacion || null,
      estadoCivil,
      direccion,
      barrio,
      ocupacion,
      estudios,
      telefono: telefono || null,
      correo: correo || null,
      antecedentes: antecedentes || null,
      comisariaId: comisariaId ? parseInt(comisariaId) : null
    });
    
    console.log('✅ Victimario creado exitosamente:', victimario.id);
    
    res.status(201).json({
      success: true,
      message: 'Victimario creado exitosamente',
      data: victimario
    });
    
  } catch (error) {
    console.error('❌ Error al crear victimario:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear victimario', 
      error: error.message,
      details: error.errors ? error.errors.map(e => e.message) : []
    });
  }
};

// Obtener victimario por Id
exports.getVictimarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const victimario = await Victimario.findByPk(id);
    
    if (!victimario) {
      return res.status(404).json({
        success: false,
        message: 'Victimario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: victimario
    });
    
  } catch (error) {
    console.error('Error en getVictimarioById:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener victimario', 
      error: error.message 
    });
  }
};

// Actualizar victimario por Id - versión actualizada
exports.updateVictimario = async (req, res) => {
  try {
    const { id } = req.params;
    
    const victimario = await Victimario.findByPk(id);
    if (!victimario) {
      return res.status(404).json({
        success: false,
        message: 'Victimario no encontrado'
      });
    }

    // Actualizar solo los campos que vienen en el body
    const camposPermitidos = [
      'nombreCompleto', 'fechaNacimiento', 'edad', 'tipoDocumento', 
      'otroTipoDocumento', 'numeroDocumento', 'documentoExpedido', 
      'sexo', 'lgtbi', 'cualLgtbi', 'otroGeneroIdentificacion',
      'estadoCivil', 'direccion', 'barrio', 'ocupacion', 'estudios',
      'telefono', 'correo', 'antecedentes', 'comisariaId'
    ];
    
    const datosActualizar = {};
    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        if (campo === 'edad' || campo === 'comisariaId') {
          datosActualizar[campo] = parseInt(req.body[campo]) || 0;
        } else {
          datosActualizar[campo] = req.body[campo];
        }
      }
    }
    
    await victimario.update(datosActualizar);
    
    res.json({
      success: true,
      message: 'Victimario actualizado exitosamente',
      data: victimario
    });
    
  } catch (error) {
    console.error('Error al actualizar victimario:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar victimario', 
      error: error.message 
    });
  }
};

// Eliminar victimario por Id
exports.deleteVictimario = async (req, res) => {
  try {
    const { id } = req.params;
    const victimario = await Victimario.findByPk(id);
    
    if (!victimario) {
      return res.status(404).json({
        success: false,
        message: 'Victimario no encontrado'
      });
    }

    await victimario.destroy();
    
    res.json({
      success: true,
      message: 'Victimario eliminado correctamente'
    });
    
  } catch (error) {
    console.error('Error al eliminar victimario:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar victimario', 
      error: error.message 
    });
  }
};

// Buscar victimarios por documento o nombre
exports.searchVictimarios = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'La búsqueda requiere al menos 3 caracteres'
      });
    }
    
    const victimarios = await Victimario.findAll({
      where: {
        [sequelize.Op.or]: [
          { nombreCompleto: { [sequelize.Op.like]: `%${query}%` } },
          { numeroDocumento: { [sequelize.Op.like]: `%${query}%` } }
        ]
      },
      limit: 50,
      order: [['nombreCompleto', 'ASC']]
    });
    
    res.json({
      success: true,
      count: victimarios.length,
      data: victimarios
    });
    
  } catch (error) {
    console.error('Error en searchVictimarios:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al buscar victimarios', 
      error: error.message 
    });
  }
};

// Obtener victimarios por comisaria
exports.getVictimariosByComisaria = async (req, res) => {
  try {
    const { comisariaId } = req.params;
    
    const victimarios = await Victimario.findAll({
      where: { comisariaId: parseInt(comisariaId) },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      count: victimarios.length,
      data: victimarios
    });
    
  } catch (error) {
    console.error('Error en getVictimariosByComisaria:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener victimarios por comisaría', 
      error: error.message 
    });
  }
};