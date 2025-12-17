const Victimario = require('../models/victimarios.js');

// Obtener todos los victimarios registrados
exports.getVictimarios = async (req, res) => {
  try {
    const victimarios = await Victimario.findAll();
    res.json(victimarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener victimario', error });
  }
};

// Crear victimario
exports.createVictimario = async (req, res) => {
  try {
    const nombre = req.body.nombreCompleto;
    const nacimiento = req.body.fechaNacimiento;
    const edad = req.body.edad;
    const tipoDoc = req.body.tipoDocumento;
    const otroDoc = req.body.otroTipoDocumento;
    const numeroDoc = req.body.numeroDocumento;
    const expedicionDoc = req.body.documentoExpedido;
    const sexo = req.body.sexo;
    const lgt = req.body.lgtbi;
    const cualLgt = req.body.cualLgtbi;
    const estadoC = req.body.estadoCivil;
    const direccion = req.body.direccion;
    const barrio = req.body.barrio;
    const ocupacion = req.body.ocupacion;
    const estudios = req.body.estudios;
    
    const victimario = await Victimario.create({ 
      nombreCompleto: nombre, 
      fechaNacimiento: nacimiento,
      edad: edad,
      tipoDocumento: tipoDoc,
      otroTipoDocumento: otroDoc,
      numeroDocumento: numeroDoc,
      documentoExpedido: expedicionDoc,
      sexo: sexo,
      lgtbi: lgt,
      cualLgtbi: cualLgt,
      estadoCivil: estadoC,
      direccion: direccion,
      barrio: barrio,
      ocupacion: ocupacion,
      estudios: estudios,
    });
    
    res.status(201).json(victimario);
  } catch (error) {
    console.log('Error al crear victimario:', error);
    res.status(500).json({ message: 'Error al crear victimario', error });
  }
};

// Obtener victimario por Id
exports.getVictimarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const victimario = await Victimario.findByPk(id);
    if (!victimario) return res.status(404).json({ message: 'Victimario no encontrada' });
    res.json(victimario);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener victimario', error });
  }
};

// Actualizar victimario por Id
exports.updateVictimario = async (req, res) => {
  try {
    const { id } = req.params;
    const nombre = req.body.nombreCompleto;
    const nacimiento = req.body.fechaNacimiento;
    const edad = req.body.edad;
    const tipoDoc = req.body.tipoDocumento;
    const otroDoc = req.body.otroTipoDocumento;
    const numeroDoc = req.body.numeroDocumento;
    const expedicionDoc = req.body.documentoExpedido;
    const sexo = req.body.sexo;
    const lgt = req.body.lgtbi;
    const cualLgt = req.body.cualLgtbi;
    const estadoC = req.body.estadoCivil;
    const direccion = req.body.direccion;
    const barrio = req.body.barrio;
    const ocupacion = req.body.ocupacion;
    const estudios = req.body.estudios;
    
    const victimario = await Victimario.findByPk(id);
    if (!victimario) return res.status(404).json({ message: 'Victimario no encontrada' });

    await victimario.update({ 
      nombreCompleto: nombre, 
      fechaNacimiento: nacimiento,
      edad: edad,
      tipoDocumento: tipoDoc,
      otroTipoDocumento: otroDoc,
      numeroDocumento: numeroDoc,
      documentoExpedido: expedicionDoc,
      sexo: sexo,
      lgtbi: lgt,
      cualLgtbi: cualLgt,
      estadoCivil: estadoC,
      direccion: direccion,
      barrio: barrio,
      ocupacion: ocupacion,
      estudios: estudios,
    });
    res.json(victimario);
  } catch (error) {
    console.log('Error al actualizar victimario:', error);
    res.status(500).json({ message: 'Error al actualizar victimario', error });
  }
};

// Eliminar victimario por Id
exports.deleteVictimario = async (req, res) => {
  try {
    const { id } = req.params;
    const victimario = await Victimario.findByPk(id);
    if (!victimario) return res.status(404).json({ message: 'Victimario no encontrada' });

    await victimario.destroy();
    res.json({ message: 'Victimario eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar Victimario', error });
  }
};
