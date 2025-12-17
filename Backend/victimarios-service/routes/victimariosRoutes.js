const express = require('express');
const router = express.Router();
const victimariosController = require('../controllers/victimariosController.js')

router.get('/', victimariosController.getVictimarios);
router.post('/', victimariosController.createVictimario);
router.get('/:id', victimariosController.getVictimarioById);
router.put('/:id', victimariosController.updateVictimario);
router.delete('/:id', victimariosController.deleteVictimario);

module.exports = router;