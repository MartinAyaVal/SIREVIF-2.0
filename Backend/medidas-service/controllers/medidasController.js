const Medidas = require('../models/medidas.js');

// Obterner todas las medidas de protección registradas
exports.getMedidas = async (req, res) => {
  try {
    const medidas = await Medidas.findAll();
    res.json(medidas);
  } catch (error){
    console.error('Error en getMedidas:', error);
    res.status(500).json({ message: 'Error al obtener medidas de protección', error: error.message });
  }
}

// Crear medida de protección
exports.createMedidas = async (req, res) => {
  try{
    const numero = req.body.numeroMedida;
    const lugar = req.body.lugarHechos;
    const tipoV = req.body.tipoViolencia;
    const fechaUH = req.body.fechaUltimosHechos;
    const horaUH = req.body.horaUltimosHechos;

    const medida = await Medidas.create({
      numeroMedida: numero,
      lugarHechos: lugar,
      tipoViolencia: tipoV,
      fechaUltimosHechos: fechaUH,
      horaUltimosHechos: horaUH
    })

    res.status(201).json(medida)
  } catch (error) {
    console.log('Error al crear medida de protección:', error);
    res.status(500).json({message: 'Error al crear medida de protección', error: error.message})
  }
} 

// Obtener medida de protección por Id
exports.getMedidasById = async (req, res) => {
  try {
    const {id} = req.params;
    const medida = await Medidas.findByPk(id);
    if (!medida) return res.status (404).json({message : 'Medida de protección no encontrada'});
    res.json(medida)
  }catch(error){
    res.status(500).json({message: 'Error al obtener medida de protección', error: error.message})
  }
}

// Actualizar medida de protección por Id
exports.updateMedidas = async (req, res) => {
  try{
    const { id } = req.params;
    const numero = req.body.numeroMedida;
    const lugar = req.body.lugarHechos;
    const tipoV = req.body.tipoViolencia;
    const fechaUH = req.body.fechaUltimosHechos;
    const horaUH = req.body.horaUltimosHechos;

    const medida = await Medidas.findByPk(id);
    if (!medida) return res.status(404).json({ message: 'Medida de protección no encontrada'});

    await medida.update({
      numeroMedida: numero,
      lugarHechos: lugar,
      tipoViolencia: tipoV,
      fechaUltimosHechos: fechaUH,
      horaUltimosHechos: horaUH
    })
    res.json(medida)
  } catch (error){
    console.log('Error al actulizar medida de proteccion:', error);
    res.status(500).json({ message: 'Error al actualizar medida de protección:', error: error.message})
  }
}

// Eliminar medida de protección por Id
exports.deleteMedidas = async (req, res) => {
  try {
    const { id } = req.params;
    const medida = await Medidas.findByPk(id);
    if (!medida) return res.status(404).json({ message: 'Medida de protección no encontrada'});

    await medida.destroy();
    res.json({ message: 'Medida de protección eliminada correctamente'})
} catch (error) {
  res.status(500).json({ message: 'Error al eliminar medida de protección: ', error: error.message})
  }
}