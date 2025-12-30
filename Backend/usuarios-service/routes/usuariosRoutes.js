const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuariosController.js');

router.get('/', usuarioController.getusuario);

router.get('/health', (req, res) => {
    res.json({ 
        success: true,
        status: 'Servidor de usuarios corriendo correctamente',
        timestamp: new Date().toISOString()
    });
});

router.get('/:id', usuarioController.getusuariosById);
router.put('/:id', usuarioController.updateusuario);
router.delete('/:id', usuarioController.deleteusuario);
router.patch('/:id/estado', usuarioController.cambiarEstadoUsuario);
router.post('/', usuarioController.createusuario);

module.exports = router;