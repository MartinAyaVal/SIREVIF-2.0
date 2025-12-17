const express = require('express');
const router = express.Router();
const victimasController = require('../controllers/victimasController.js')

router.get('/', victimasController.getVictimas);
router.post('/', victimasController.createVictima);
router.get('/:id', victimasController.getVictimaById);
router.put('/:id', victimasController.updateVictima);
router.delete('/:id', victimasController.deleteVictima);

module.exports = router;