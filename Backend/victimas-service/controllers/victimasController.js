const Victima = require('../models/victimas.js');

// Obtener todas las victimas registradas
exports.getVictimas = async (req, res) => {
  try {
    const victimas = await Victima.findAll();
    res.json(victimas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener víctimas', error });
  }
};

// Crear victima
exports.createVictima = async (req, res) => {
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
    const parentesco = req.body.parentesco;
    
    const victima = await Victima.create({ 
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
      parentesco: parentesco 
    });
    
    res.status(201).json(victima);
  } catch (error) {
    console.log('Error al crear víctima:', error);
    res.status(500).json({ message: 'Error al crear víctima', error });
  }
};

// Obtener victima por Id
exports.getVictimaById = async (req, res) => {
  try {
    const { id } = req.params;
    const victima = await Victima.findByPk(id);
    if (!victima) return res.status(404).json({ message: 'Víctima no encontrada' });
    res.json(victima);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener víctima', error });
  }
};

// Actualizar victima por Id
exports.updateVictima = async (req, res) => {
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
    const parentesco = req.body.parentesco;
    
    const victima = await Victima.findByPk(id);
    if (!victima) return res.status(404).json({ message: 'Víctima no encontrada' });

    await victima.update({ 
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
      parentesco: parentesco 
    });
    res.json(victima);
  } catch (error) {
    console.log('Error al actualizar víctima:', error);
    res.status(500).json({ message: 'Error al actualizar víctima', error });
  }
};

// Eliminar victima por Id
exports.deleteVictima = async (req, res) => {
  try {
    const { id } = req.params;
    const victima = await Victima.findByPk(id);
    if (!victima) return res.status(404).json({ message: 'Víctima no encontrada' });

    await victima.destroy();
    res.json({ message: 'Víctima eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar Víctima', error });
  }
};
