const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuariosController.js');
const usuario = require('../models/usuarios');

router.get('/', usuarioController.getusuario);
router.post('/', usuarioController.createusuario);
router.get('/:id', usuarioController.getusuariosById);
router.put('/:id', usuarioController.updateusuario);
router.delete('/:id', usuarioController.deleteusuario);
router.patch('/:id/estado', usuarioController.cambiarEstadoUsuario);

module.exports = router;