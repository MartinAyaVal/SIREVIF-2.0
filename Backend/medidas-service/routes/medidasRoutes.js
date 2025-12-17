const express = require('express');
const router = express.Router();
const medidaController = require('../controllers/medidasController.js')

router.get('/', medidaController.getMedidas);
router.post('/', medidaController.createMedidas);
router.get('/:id', medidaController.getMedidasById);
router.put('/:id', medidaController.updateMedidas);
router.delete('/:id', medidaController.deleteMedidas);

module.exports = router;