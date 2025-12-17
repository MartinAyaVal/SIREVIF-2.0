const express = require('express');
const router = express.Router();
const comisariaController = require('../controllers/comisariasController.js');

router.get('/', comisariaController.getComisarias);
router.post('/', comisariaController.createComisaria);
router.get('/:id', comisariaController.getComisariaById);
router.put('/:id', comisariaController.updateComisaria);
router.delete('/:id', comisariaController.deleteComisaria);

module.exports = router;