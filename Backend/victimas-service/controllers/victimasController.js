const Victima = require('../models/victimas.js');
const sequelize = require('../db/config.js');

// Obtener todas las victimas registradas
exports.getVictimas = async (req, res) => {
  try {
    const victimas = await Victima.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(victimas);
  } catch (error) {
    console.error('Error en getVictimas:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener víctimas', 
      error: error.message 
    });
  }
};

// Crear victima - versión actualizada para formulario
exports.createVictima = async (req, res) => {
  try {
    console.log('📥 Datos recibidos para crear víctima:', req.body);
    
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
      aparentescoConVictimario,
      telefono,
      correo,
      tipoVictimaId,
      comisariaId,
      medidaId
    } = req.body;

    // Validación de campos requeridos
    const camposRequeridos = [
      'nombreCompleto', 'fechaNacimiento', 'edad', 'tipoDocumento', 
      'numeroDocumento', 'sexo', 'tipoVictimaId', 'comisariaId', 'medidaId'
    ];
    
    for (const campo of camposRequeridos) {
      if (!req.body[campo]) {
        return res.status(400).json({
          success: false,
          message: `El campo '${campo}' es requerido`
        });
      }
    }

    // Crear la víctima
    const victima = await Victima.create({
      nombreCompleto,
      fechaNacimiento,
      edad: parseInt(edad) || 0,
      tipoDocumento,
      otroTipoDocumento: otroTipoDocumento || null,
      numeroDocumento: numeroDocumento.toString(),
      documentoExpedido: documentoExpedido || null,
      sexo,
      lgtbi: lgtbi || 'NO',
      cualLgtbi: cualLgtbi || null,
      otroGeneroIdentificacion: otroGeneroIdentificacion || null,
      estadoCivil: estadoCivil || null,
      direccion: direccion || null,
      barrio: barrio || null,
      ocupacion: ocupacion || null,
      estudios: estudios || null,
      aparentescoConVictimario: aparentescoConVictimario || null,
      telefono: telefono || null,
      correo: correo || null,
      tipoVictimaId: parseInt(tipoVictimaId),
      comisariaId: parseInt(comisariaId),
      medidaId: parseInt(medidaId)
    });
    
    console.log('✅ Víctima creada exitosamente:', victima.id);
    
    res.status(201).json({
      success: true,
      message: 'Víctima creada exitosamente',
      data: victima
    });
    
  } catch (error) {
    console.error('❌ Error al crear víctima:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear víctima', 
      error: error.message,
      details: error.errors ? error.errors.map(e => e.message) : []
    });
  }
};

// Crear múltiples víctimas (para medidas completas)
exports.createMultipleVictimas = async (req, res) => {
  try {
    const { victimas } = req.body;
    
    if (!victimas || !Array.isArray(victimas) || victimas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de víctimas'
      });
    }
    
    const victimasCreadas = await Victima.bulkCreate(victimas, {
      validate: true,
      individualHooks: true
    });
    
    res.status(201).json({
      success: true,
      message: `${victimasCreadas.length} víctima(s) creada(s) exitosamente`,
      data: victimasCreadas
    });
    
  } catch (error) {
    console.error('❌ Error al crear múltiples víctimas:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear víctimas', 
      error: error.message
    });
  }
};

// Obtener victima por Id con relaciones
exports.getVictimaById = async (req, res) => {
  try {
    const { id } = req.params;
    const victima = await Victima.findByPk(id);
    
    if (!victima) {
      return res.status(404).json({
        success: false,
        message: 'Víctima no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: victima
    });
    
  } catch (error) {
    console.error('Error en getVictimaById:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener víctima', 
      error: error.message 
    });
  }
};

// Actualizar victima por Id - versión actualizada
exports.updateVictima = async (req, res) => {
  try {
    const { id } = req.params;
    
    const victima = await Victima.findByPk(id);
    if (!victima) {
      return res.status(404).json({
        success: false,
        message: 'Víctima no encontrada'
      });
    }

    // Actualizar solo los campos que vienen en el body
    const camposPermitidos = [
      'nombreCompleto', 'fechaNacimiento', 'edad', 'tipoDocumento', 
      'otroTipoDocumento', 'numeroDocumento', 'documentoExpedido', 
      'sexo', 'lgtbi', 'cualLgtbi', 'otroGeneroIdentificacion',
      'estadoCivil', 'direccion', 'barrio', 'ocupacion', 'estudios',
      'aparentescoConVictimario', 'telefono', 'correo', 'tipoVictimaId',
      'comisariaId', 'medidaId'
    ];
    
    const datosActualizar = {};
    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        if (campo === 'edad' || campo === 'tipoVictimaId' || campo === 'comisariaId' || campo === 'medidaId') {
          datosActualizar[campo] = parseInt(req.body[campo]) || 0;
        } else {
          datosActualizar[campo] = req.body[campo];
        }
      }
    }
    
    await victima.update(datosActualizar);
    
    res.json({
      success: true,
      message: 'Víctima actualizada exitosamente',
      data: victima
    });
    
  } catch (error) {
    console.error('Error al actualizar víctima:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar víctima', 
      error: error.message 
    });
  }
};

// Eliminar victima por Id
exports.deleteVictima = async (req, res) => {
  try {
    const { id } = req.params;
    const victima = await Victima.findByPk(id);
    
    if (!victima) {
      return res.status(404).json({
        success: false,
        message: 'Víctima no encontrada'
      });
    }

    await victima.destroy();
    
    res.json({
      success: true,
      message: 'Víctima eliminada correctamente'
    });
    
  } catch (error) {
    console.error('Error al eliminar víctima:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar víctima', 
      error: error.message 
    });
  }
};

// Obtener víctimas por medidaId
exports.getVictimasByMedidaId = async (req, res) => {
  try {
    const { medidaId } = req.params;
    
    const victimas = await Victima.findAll({
      where: { medidaId: parseInt(medidaId) },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      count: victimas.length,
      data: victimas
    });
    
  } catch (error) {
    console.error('Error en getVictimasByMedidaId:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener víctimas por medida', 
      error: error.message 
    });
  }
};

// Buscar víctimas por documento o nombre
exports.searchVictimas = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'La búsqueda requiere al menos 3 caracteres'
      });
    }
    
    const victimas = await Victima.findAll({
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
      count: victimas.length,
      data: victimas
    });
    
  } catch (error) {
    console.error('Error en searchVictimas:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al buscar víctimas', 
      error: error.message 
    });
  }
};