// medidas-service/controllers/medidasController.js - VERSIÓN COMPLETA CON TODAS LAS FUNCIONES
const { sequelize, Medidas, Comisaria, Usuario, Victimas, Victimarios, TipoVictima } = require('../../shared-models');
const { Op } = require('sequelize');

// ===== 1. CREAR MEDIDA COMPLETA (FUNCIÓN PRINCIPAL) =====
exports.createMedidaCompleta = async (req, res) => {
  console.log('🔨 [CREATE] Iniciando creación de medida completa');
  
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      medida,      // datos de la medida de protección
      victimario,  // datos del victimario (opcional)
      victimas     // array de víctimas (mínimo 1)
    } = req.body;
    
    console.log('📦 Datos recibidos:', {
      medida: medida ? '✅ SÍ' : '❌ NO',
      victimario: victimario ? '✅ SÍ' : '❌ NO',
      victimas: victimas ? `✅ ${victimas.length} víctima(s)` : '❌ NO'
    });
    
    // ===== VALIDACIONES =====
    
    // 1. Validar que vengan datos de medida
    if (!medida) {
      throw new Error('Se requieren datos de la medida de protección');
    }
    
    // 2. Validar campos obligatorios de la medida (SOLO campos del formulario)
    const camposRequeridosMedida = [
      'numeroMedida', 'lugarHechos', 'tipoViolencia', 
      'fechaUltimosHechos', 'horaUltimosHechos', 
      'comisariaId', 'usuarioId'
    ];
    
    for (const campo of camposRequeridosMedida) {
      if (!medida[campo]) {
        throw new Error(`El campo '${campo}' es requerido en la medida`);
      }
    }
    
    // 3. Validar que haya al menos una víctima
    if (!victimas || !Array.isArray(victimas) || victimas.length === 0) {
      throw new Error('Se requiere al menos una víctima');
    }
    
    console.log('✅ Validaciones completadas');
    
    // ===== CREACIÓN EN TRANSACCIÓN =====
    
    let victimarioId = null;
    
    // 1. Crear victimario (si se proporciona)
    if (victimario && Object.keys(victimario).length > 0) {
      console.log('👤 Creando victimario...');
      
      // Validar campos del victimario
      const camposVictimario = ['nombreCompleto', 'tipoDocumento', 'numeroDocumento', 'sexo'];
      for (const campo of camposVictimario) {
        if (!victimario[campo]) {
          throw new Error(`El campo '${campo}' es requerido en el victimario`);
        }
      }
      
      // Verificar si el victimario ya existe (por documento)
      const victimarioExistente = await Victimarios.findOne({
        where: { numeroDocumento: victimario.numeroDocumento.toString() }
      }, { transaction });
      
      if (victimarioExistente) {
        // Usar el victimario existente
        victimarioId = victimarioExistente.id;
        console.log(`✅ Victimario existente encontrado - ID: ${victimarioId}`);
      } else {
        // Crear nuevo victimario
        const victimarioInstance = await Victimarios.create({
          ...victimario,
          numeroDocumento: victimario.numeroDocumento.toString(),
          edad: parseInt(victimario.edad) || 0,
          comisariaId: medida.comisariaId
        }, { transaction });
        
        victimarioId = victimarioInstance.id;
        console.log(`✅ Nuevo victimario creado - ID: ${victimarioId}`);
      }
    } else {
      console.log('ℹ️ No se proporcionó victimario');
    }
    
    // 2. Crear la medida de protección
    console.log('📝 Creando medida de protección...');
    
    // Preparar datos de la medida (SOLO campos del formulario)
    const medidaData = {
      numeroMedida: parseInt(medida.numeroMedida),
      lugarHechos: medida.lugarHechos,
      tipoViolencia: medida.tipoViolencia,
      fechaUltimosHechos: medida.fechaUltimosHechos,
      horaUltimosHechos: medida.horaUltimosHechos,
      comisariaId: parseInt(medida.comisariaId),
      usuarioId: parseInt(medida.usuarioId),
      victimarioId: victimarioId
    };
    
    const medidaInstance = await Medidas.create(medidaData, { transaction });
    console.log(`✅ Medida creada - ID: ${medidaInstance.id}, Número: ${medidaInstance.numeroMedida}`);
    
    // 3. Crear víctimas
    console.log(`👥 Creando ${victimas.length} víctima(s)...`);
    let victimasCreadas = [];
    
    for (let i = 0; i < victimas.length; i++) {
      const victima = victimas[i];
      
      // Validar campos de cada víctima
      const camposVictima = ['nombreCompleto', 'tipoDocumento', 'numeroDocumento', 'sexo', 'tipoVictimaId'];
      for (const campo of camposVictima) {
        if (!victima[campo]) {
          throw new Error(`Víctima ${i+1}: El campo '${campo}' es requerido`);
        }
      }
      
      // Crear víctima
      const victimaData = {
        ...victima,
        numeroDocumento: victima.numeroDocumento.toString(),
        edad: parseInt(victima.edad) || 0,
        tipoVictimaId: parseInt(victima.tipoVictimaId),
        comisariaId: parseInt(medida.comisariaId),
        medidaId: medidaInstance.id
      };
      
      const victimaCreada = await Victimas.create(victimaData, { transaction });
      victimasCreadas.push(victimaCreada);
      
      console.log(`  ✅ Víctima ${i+1} creada - ID: ${victimaCreada.id}`);
    }
    
    // Confirmar transacción
    await transaction.commit();
    console.log('✅ Transacción confirmada exitosamente');
    
    // ===== OBTENER MEDIDA COMPLETA CON RELACIONES =====
    console.log('🔄 Obteniendo medida completa con relaciones...');
    
    const medidaCompleta = await Medidas.findByPk(medidaInstance.id, {
      include: [
        {
          model: Comisaria,
          as: 'comisaria',
          attributes: ['id', 'numero', 'lugar']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'documento', 'cargo', 'comisaria_rol']
        },
        {
          model: Victimarios,
          as: 'victimario',
          attributes: ['id', 'nombreCompleto', 'tipoDocumento', 'numeroDocumento', 'sexo', 'edad']
        },
        {
          model: Victimas,
          as: 'victimas',
          attributes: ['id', 'nombreCompleto', 'tipoDocumento', 'numeroDocumento', 'sexo', 'edad', 'tipoVictimaId'],
          include: [
            {
              model: TipoVictima,
              as: 'tipoVictima',
              attributes: ['id', 'tipo']
            }
          ]
        }
      ]
    });
    
    console.log('🎉 Medida completa creada exitosamente');
    
    // ===== RESPUESTA FINAL =====
    res.status(201).json({
      success: true,
      message: 'Medida de protección creada exitosamente',
      data: {
        medida: medidaCompleta,
        resumen: {
          totalVictimas: victimasCreadas.length,
          totalVictimarios: victimarioId ? 1 : 0,
          numeroMedida: medidaInstance.numeroMedida,
          fechaCreacion: new Date().toISOString()
        }
      }
    });
    
  } catch (error) {
    // Revertir transacción en caso de error
    await transaction.rollback();
    
    console.error('❌ Error en createMedidaCompleta:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear medida completa', 
      error: error.message,
      details: error.errors ? error.errors.map(e => e.message) : []
    });
  }
};

// ===== 2. OBTENER MEDIDA COMPLETA POR ID =====
exports.getMedidaCompleta = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Buscando medida completa ID: ${id}`);
    
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
          attributes: ['id', 'nombre', 'documento', 'cargo', 'comisaria_rol']
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
          include: [
            {
              model: TipoVictima,
              as: 'tipoVictima',
              attributes: ['id', 'tipo']
            }
          ]
        }
      ]
    });
    
    if (!medida) {
      return res.status(404).json({
        success: false,
        message: 'Medida no encontrada'
      });
    }
    
    console.log(`✅ Medida encontrada - Número: ${medida.numeroMedida}`);
    
    res.json({
      success: true,
      data: medida
    });
    
  } catch (error) {
    console.error('Error en getMedidaCompleta:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener medida completa', 
      error: error.message 
    });
  }
};

// ===== 3. OBTENER TODAS LAS MEDIDAS CON RELACIONES BÁSICAS =====
exports.getMedidasConRelaciones = async (req, res) => {
  try {
    const { comisariaId, limit = 100, offset = 0 } = req.query;
    
    console.log(`📋 Obteniendo medidas con relaciones`);
    
    // Construir filtros
    const where = {};
    if (comisariaId) where.comisariaId = parseInt(comisariaId);
    
    const medidas = await Medidas.findAll({
      where,
      include: [
        {
          model: Comisaria,
          as: 'comisaria',
          attributes: ['numero', 'lugar']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'cargo']
        },
        {
          model: Victimas,
          as: 'victimas',
          attributes: ['id'],
          required: false
        }
      ],
      order: [['fecha_creacion', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // Procesar resultados para agregar conteo
    const medidasConConteo = medidas.map(medida => {
      const medidaJson = medida.toJSON();
      medidaJson.total_victimas = medidaJson.victimas ? medidaJson.victimas.length : 0;
      delete medidaJson.victimas;
      return medidaJson;
    });
    
    // Obtener total para paginación
    const total = await Medidas.count({ where });
    
    console.log(`✅ Encontradas ${medidasConConteo.length} medidas (Total: ${total})`);
    
    res.json({
      success: true,
      data: medidasConConteo,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + medidasConConteo.length) < total
      }
    });
    
  } catch (error) {
    console.error('Error en getMedidasConRelaciones:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener medidas', 
      error: error.message 
    });
  }
};

// ===== 4. OBTENER TODAS LAS MEDIDAS (BÁSICO) =====
exports.getMedidas = async (req, res) => {
  try {
    const medidas = await Medidas.findAll({
      order: [['fecha_creacion', 'DESC']],
      limit: 100
    });
    
    res.json({
      success: true,
      count: medidas.length,
      data: medidas
    });
  } catch (error) {
    console.error('Error en getMedidas:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Error en el servidor',
      detalle: error.message 
    });
  }
};

// ===== 5. OBTENER MEDIDA POR ID (BÁSICO) =====
exports.getMedidasById = async (req, res) => {
  try {
    const { id } = req.params;
    const medida = await Medidas.findByPk(id);
    
    if (!medida) {
      return res.status(404).json({
        success: false,
        message: 'Medida de protección no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: medida
    });
    
  } catch (error) {
    console.error('Error en getMedidasById:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener medida de protección',
      error: error.message
    });
  }
};

// ===== 6. CREAR MEDIDA BÁSICA (FUNCIÓN FALTANTE) =====
exports.createMedidas = async (req, res) => {
  try {
    console.log('📝 Creando medida básica...');
    
    const { 
      numeroMedida, 
      lugarHechos, 
      tipoViolencia, 
      fechaUltimosHechos, 
      horaUltimosHechos, 
      comisariaId, 
      usuarioId, 
      victimarioId 
    } = req.body;

    // Validar campos requeridos
    const camposRequeridos = ['numeroMedida', 'lugarHechos', 'tipoViolencia', 'fechaUltimosHechos', 'horaUltimosHechos', 'comisariaId', 'usuarioId'];
    for (const campo of camposRequeridos) {
      if (!req.body[campo]) {
        return res.status(400).json({
          success: false,
          message: `El campo '${campo}' es requerido`
        });
      }
    }

    // Crear medida básica
    const medida = await Medidas.create({
      numeroMedida: parseInt(numeroMedida),
      lugarHechos: lugarHechos,
      tipoViolencia: tipoViolencia,
      fechaUltimosHechos: fechaUltimosHechos,
      horaUltimosHechos: horaUltimosHechos,
      comisariaId: parseInt(comisariaId),
      usuarioId: parseInt(usuarioId),
      victimarioId: victimarioId ? parseInt(victimarioId) : null
    });

    console.log(`✅ Medida básica creada - ID: ${medida.id}`);

    res.status(201).json({
      success: true,
      message: 'Medida creada exitosamente',
      data: medida
    });

  } catch (error) {
    console.error('❌ Error en createMedidas:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear medida', 
      error: error.message
    });
  }
};

// ===== 7. ACTUALIZAR MEDIDA =====
exports.updateMedidas = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    console.log(`✏️ Actualizando medida ID: ${id}`);
    
    const medida = await Medidas.findByPk(id, { transaction });
    if (!medida) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Medida de protección no encontrada'
      });
    }

    // Campos permitidos para actualizar
    const camposPermitidos = [
      'numeroMedida', 'lugarHechos', 'tipoViolencia', 
      'fechaUltimosHechos', 'horaUltimosHechos',
      'comisariaId', 'usuarioId', 'victimarioId'
    ];
    
    const datosActualizar = {};
    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        if (campo.includes('Id') || campo === 'numeroMedida') {
          datosActualizar[campo] = parseInt(req.body[campo]) || null;
        } else {
          datosActualizar[campo] = req.body[campo];
        }
      }
    }
    
    await medida.update(datosActualizar, { transaction });
    
    await transaction.commit();
    
    console.log(`✅ Medida actualizada ID: ${id}`);
    
    res.json({
      success: true,
      message: 'Medida actualizada exitosamente',
      data: medida
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar medida:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar medida de protección',
      error: error.message
    });
  }
};

// ===== 8. ELIMINAR MEDIDA =====
exports.deleteMedidas = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Eliminando medida ID: ${id}`);
    
    const medida = await Medidas.findByPk(id, { transaction });
    if (!medida) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Medida de protección no encontrada'
      });
    }

    await medida.destroy({ transaction });
    
    await transaction.commit();
    
    console.log(`✅ Medida eliminada ID: ${id}`);
    
    res.json({
      success: true,
      message: 'Medida eliminada correctamente'
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar medida:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar medida de protección',
      error: error.message
    });
  }
};

// ===== 9. BUSCAR MEDIDAS =====
exports.searchMedidas = async (req, res) => {
  try {
    const { 
      query, 
      comisariaId
    } = req.query;
    
    console.log('🔍 Buscando medidas con filtros');
    
    // Construir condiciones de búsqueda
    const where = {};
    
    if (comisariaId) where.comisariaId = parseInt(comisariaId);
    
    // Búsqueda por número de medida o lugar
    if (query) {
      where[Op.or] = [
        { numeroMedida: { [Op.like]: `%${query}%` } },
        { lugarHechos: { [Op.like]: `%${query}%` } }
      ];
    }
    
    const medidas = await Medidas.findAll({
      where,
      include: [
        {
          model: Comisaria,
          as: 'comisaria',
          attributes: ['numero', 'lugar']
        }
      ],
      order: [['fecha_creacion', 'DESC']],
      limit: 50
    });
    
    console.log(`✅ Encontradas ${medidas.length} medidas`);
    
    res.json({
      success: true,
      count: medidas.length,
      data: medidas
    });
    
  } catch (error) {
    console.error('Error en searchMedidas:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al buscar medidas',
      error: error.message
    });
  }
};

// ===== 10. OBTENER ESTADÍSTICAS =====
exports.getEstadisticas = async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas...');
    
    const totalMedidas = await Medidas.count();
    const totalVictimas = await Victimas.count();
    const totalVictimarios = await Victimarios.count();
    
    const medidasPorComisaria = await Medidas.findAll({
      attributes: [
        'comisariaId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      group: ['comisariaId'],
      include: [
        {
          model: Comisaria,
          as: 'comisaria',
          attributes: ['numero', 'lugar']
        }
      ]
    });
    
    console.log('✅ Estadísticas obtenidas');
    
    res.json({
      success: true,
      data: {
        totales: {
          medidas: totalMedidas,
          victimas: totalVictimas,
          victimarios: totalVictimarios
        },
        medidasPorComisaria,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error en getEstadisticas:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// ===== 11. OBTENER MEDIDAS POR COMISARÍA =====
exports.getMedidasPorComisaria = async (req, res) => {
  try {
    const { comisariaId } = req.params;
    
    console.log(`🏢 Obteniendo medidas para comisaría ID: ${comisariaId}`);
    
    const medidas = await Medidas.findAll({
      where: { 
        comisariaId: parseInt(comisariaId)
      },
      include: [
        {
          model: Comisaria,
          as: 'comisaria',
          attributes: ['numero', 'lugar']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'cargo']
        }
      ],
      order: [['fecha_creacion', 'DESC']]
    });
    
    // Contar víctimas por medida
    const medidasConConteo = await Promise.all(
      medidas.map(async (medida) => {
        const medidaJson = medida.toJSON();
        const conteoVictimas = await Victimas.count({
          where: { medidaId: medida.id }
        });
        medidaJson.total_victimas = conteoVictimas;
        return medidaJson;
      })
    );
    
    console.log(`✅ Encontradas ${medidasConConteo.length} medidas para comisaría ${comisariaId}`);
    
    res.json({
      success: true,
      count: medidasConConteo.length,
      data: medidasConConteo
    });
    
  } catch (error) {
    console.error('Error en getMedidasPorComisaria:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener medidas por comisaría',
      error: error.message
    });
  }
};