// controllers/medidasController.js - VERSIÓN COMPLETA CON RELACIONES
const { Medidas, Comisaria, Usuario, Victimas, Victimarios, TipoVictima, Rol } = require('../shared/models');

// 1. Obtener todas las medidas con información básica
exports.getMedidas = async (req, res) => {
  try {
    const medidas = await Medidas.findAll({
      include: [
        {
          model: Comisaria,
          as: 'comisaria',
          attributes: ['id', 'numero', 'lugar']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'cargo']
        },
        {
          model: Victimarios,
          as: 'victimario',
          attributes: ['id', 'nombreCompleto']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(medidas);
  } catch (error) {
    console.error('Error en getMedidas:', error);
    res.status(500).json({ 
      message: 'Error al obtener medidas de protección', 
      error: error.message 
    });
  }
}

// 2. Obtener medida COMPLETA por ID con todas las relaciones
exports.getMedidasById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const medida = await Medidas.findByPk(id, {
      include: [
        {
          model: Comisaria,
          as: 'comisaria',
          attributes: ['id', 'numero', 'lugar']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'documento', 'cargo', 'correo', 'telefono'],
          include: [{
            model: Rol,
            as: 'rol',
            attributes: ['id', 'rol']
          }]
        },
        {
          model: Victimarios,
          as: 'victimario',
          attributes: { exclude: ['createdAt', 'updatedAt'] }
        },
        {
          model: Victimas,
          as: 'victimas',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          include: [{
            model: TipoVictima,
            as: 'tipoVictima',
            attributes: ['id', 'tipo']
          }]
        }
      ]
    });
    
    if (!medida) {
      return res.status(404).json({ message: 'Medida de protección no encontrada' });
    }
    
    res.json(medida);
  } catch (error) {
    console.error('Error en getMedidasById:', error);
    res.status(500).json({ 
      message: 'Error al obtener medida de protección', 
      error: error.message 
    });
  }
}

// 3. Crear medida de protección COMPLETA (con víctimas y victimario)
exports.createMedidas = async (req, res) => {
  const transaction = await require('../shared/models').sequelize.transaction();
  
  try {
    const { 
      numeroMedida, 
      lugarHechos, 
      tipoViolencia, 
      fechaUltimosHechos, 
      horaUltimosHechos,
      comisariaId,
      usuarioId,
      victimario, // Objeto victimario (1:1)
      victimas    // Array de víctimas (1:N)
    } = req.body;

    // Validar campos requeridos
    if (!numeroMedida || !comisariaId || !usuarioId) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Faltan campos requeridos: numeroMedida, comisariaId, usuarioId' 
      });
    }

    // 1. Crear victimario primero (si existe)
    let victimarioId = null;
    if (victimario) {
      const victimarioCreado = await Victimarios.create(victimario, { transaction });
      victimarioId = victimarioCreado.id;
    }

    // 2. Crear la medida
    const medida = await Medidas.create({
      numeroMedida,
      lugarHechos,
      tipoViolencia,
      fechaUltimosHechos,
      horaUltimosHechos,
      comisariaId,
      usuarioId,
      victimarioId
    }, { transaction });

    // 3. Crear víctimas asociadas (si existen)
    let victimasCreadas = [];
    if (victimas && victimas.length > 0) {
      victimasCreadas = await Victimas.bulkCreate(
        victimas.map(victima => ({
          ...victima,
          medidaId: medida.id,
          comisariaId: comisariaId // Asignar misma comisaría que la medida
        })),
        { transaction }
      );
    }

    // 4. Commit de la transacción
    await transaction.commit();

    // 5. Obtener la medida completa con relaciones
    const medidaCompleta = await Medidas.findByPk(medida.id, {
      include: [
        {
          model: Comisaria,
          as: 'comisaria'
        },
        {
          model: Usuario,
          as: 'usuario'
        },
        {
          model: Victimarios,
          as: 'victimario'
        },
        {
          model: Victimas,
          as: 'victimas',
          include: [{
            model: TipoVictima,
            as: 'tipoVictima'
          }]
        }
      ]
    });

    res.status(201).json({
      message: 'Medida creada exitosamente',
      medida: medidaCompleta,
      victimasCreadas: victimasCreadas.length
    });

  } catch (error) {
    // Rollback en caso de error
    await transaction.rollback();
    
    console.error('Error al crear medida de protección:', error);
    
    // Manejo de errores específicos
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'El número de medida ya existe',
        error: error.errors.map(e => e.message)
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Error de validación',
        error: error.errors.map(e => e.message)
      });
    }
    
    res.status(500).json({
      message: 'Error al crear medida de protección', 
      error: error.message
    });
  }
}

// 4. Actualizar medida de protección
exports.updateMedidas = async (req, res) => {
  const transaction = await require('../shared/models').sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { 
      numeroMedida, 
      lugarHechos, 
      tipoViolencia, 
      fechaUltimosHechos, 
      horaUltimosHechos,
      comisariaId,
      usuarioId,
      victimario, // Objeto victimario actualizado
      victimas    // Array de víctimas actualizado
    } = req.body;

    // Buscar medida existente
    const medida = await Medidas.findByPk(id, { transaction });
    if (!medida) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Medida de protección no encontrada' });
    }

    // 1. Actualizar datos básicos de la medida
    await medida.update({
      numeroMedida: numeroMedida || medida.numeroMedida,
      lugarHechos: lugarHechos || medida.lugarHechos,
      tipoViolencia: tipoViolencia || medida.tipoViolencia,
      fechaUltimosHechos: fechaUltimosHechos || medida.fechaUltimosHechos,
      horaUltimosHechos: horaUltimosHechos || medida.horaUltimosHechos,
      comisariaId: comisariaId || medida.comisariaId,
      usuarioId: usuarioId || medida.usuarioId
    }, { transaction });

    // 2. Actualizar victimario (si se proporciona)
    if (victimario && medida.victimarioId) {
      await Victimarios.update(victimario, {
        where: { id: medida.victimarioId },
        transaction
      });
    }

    // 3. Manejar víctimas (actualizar/crear)
    if (victimas && victimas.length > 0) {
      // Para simplificar: eliminar todas y crear nuevas
      await Victimas.destroy({
        where: { medidaId: medida.id },
        transaction
      });
      
      await Victimas.bulkCreate(
        victimas.map(v => ({
          ...v,
          medidaId: medida.id,
          comisariaId: comisariaId || medida.comisariaId
        })),
        { transaction }
      );
    }

    // 4. Commit
    await transaction.commit();

    // 5. Obtener medida actualizada
    const medidaActualizada = await Medidas.findByPk(id, {
      include: [
        {
          model: Comisaria,
          as: 'comisaria'
        },
        {
          model: Usuario,
          as: 'usuario'
        },
        {
          model: Victimarios,
          as: 'victimario'
        },
        {
          model: Victimas,
          as: 'victimas',
          include: [{
            model: TipoVictima,
            as: 'tipoVictima'
          }]
        }
      ]
    });

    res.json({
      message: 'Medida actualizada exitosamente',
      medida: medidaActualizada
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar medida de protección:', error);
    res.status(500).json({ 
      message: 'Error al actualizar medida de protección', 
      error: error.message 
    });
  }
}

// 5. Eliminar medida de protección (con sus relaciones)
exports.deleteMedidas = async (req, res) => {
  const transaction = await require('../shared/models').sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Buscar medida
    const medida = await Medidas.findByPk(id, { transaction });
    if (!medida) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Medida de protección no encontrada' });
    }

    // 1. Eliminar víctimas asociadas
    await Victimas.destroy({
      where: { medidaId: id },
      transaction
    });

    // 2. Eliminar victimario asociado (si existe)
    if (medida.victimarioId) {
      await Victimarios.destroy({
        where: { id: medida.victimarioId },
        transaction
      });
    }

    // 3. Eliminar la medida
    await medida.destroy({ transaction });

    // 4. Commit
    await transaction.commit();

    res.json({ 
      message: 'Medida de protección eliminada correctamente con todas sus relaciones' 
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar medida de protección:', error);
    res.status(500).json({ 
      message: 'Error al eliminar medida de protección', 
      error: error.message 
    });
  }
}

// 6. Búsqueda avanzada de medidas
exports.buscarMedidas = async (req, res) => {
  try {
    const { 
      comisariaId, 
      usuarioId, 
      fechaInicio, 
      fechaFin,
      tipoViolencia,
      numeroMedida 
    } = req.query;

    const where = {};

    // Construir condiciones de búsqueda
    if (comisariaId) where.comisariaId = comisariaId;
    if (usuarioId) where.usuarioId = usuarioId;
    if (tipoViolencia) where.tipoViolencia = tipoViolencia;
    if (numeroMedida) where.numeroMedida = numeroMedida;

    // Rango de fechas
    if (fechaInicio || fechaFin) {
      where.createdAt = {};
      if (fechaInicio) where.createdAt.$gte = new Date(fechaInicio);
      if (fechaFin) where.createdAt.$lte = new Date(fechaFin);
    }

    const medidas = await Medidas.findAll({
      where,
      include: [
        {
          model: Comisaria,
          as: 'comisaria',
          attributes: ['id', 'numero', 'lugar']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'cargo']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: medidas.length,
      medidas
    });

  } catch (error) {
    console.error('Error en buscarMedidas:', error);
    res.status(500).json({ 
      message: 'Error al buscar medidas', 
      error: error.message 
    });
  }
}

// 7. Obtener estadísticas de medidas
exports.getEstadisticas = async (req, res) => {
  try {
    // Total de medidas
    const totalMedidas = await Medidas.count();
    
    // Medidas por comisaría
    const medidasPorComisaria = await Medidas.findAll({
      attributes: [
        'comisariaId',
        [require('../shared/models').sequelize.fn('COUNT', 'comisariaId'), 'total']
      ],
      group: ['comisariaId'],
      include: [{
        model: Comisaria,
        as: 'comisaria',
        attributes: ['numero', 'lugar']
      }]
    });
    
    // Medidas por tipo de violencia
    const medidasPorViolencia = await Medidas.findAll({
      attributes: [
        'tipoViolencia',
        [require('../shared/models').sequelize.fn('COUNT', 'tipoViolencia'), 'total']
      ],
      group: ['tipoViolencia']
    });
    
    // Últimas 5 medidas
    const ultimasMedidas = await Medidas.findAll({
      include: [{
        model: Comisaria,
        as: 'comisaria',
        attributes: ['numero']
      }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      totalMedidas,
      medidasPorComisaria,
      medidasPorViolencia,
      ultimasMedidas
    });

  } catch (error) {
    console.error('Error en getEstadisticas:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas', 
      error: error.message 
    });
  }
}