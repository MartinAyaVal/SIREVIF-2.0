const express = require('express');
const router = express.Router();
const victimarioController = require('../controllers/victimariosController.js');

// Rutas básicas
router.get('/', victimarioController.getVictimarios);
router.post('/', victimarioController.createVictimario);
router.get('/:id', victimarioController.getVictimarioById);
router.put('/:id', victimarioController.updateVictimario);
router.delete('/:id', victimarioController.deleteVictimario);

// Rutas específicas
router.get('/buscar/search', victimarioController.searchVictimarios);
router.get('/comisaria/:comisariaId', victimarioController.getVictimariosByComisaria);

module.exports = router;