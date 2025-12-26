const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuariosController.js');

// RUTA PRINCIPAL PARA OBTENER TODOS LOS USUARIOS
router.get('/', usuarioController.getusuario);

// RUTAS ESPECÍFICAS
router.get('/health', (req, res) => {
    res.json({ 
        success: true,
        status: 'Servidor de usuarios corriendo correctamente',
        timestamp: new Date().toISOString()
    });
});

// Rutas con parámetros
router.get('/:id', usuarioController.getusuariosById);
router.put('/:id', usuarioController.updateusuario);
router.delete('/:id', usuarioController.deleteusuario);
router.patch('/:id/estado', usuarioController.cambiarEstadoUsuario);

// Ruta para crear usuario
router.post('/', usuarioController.createusuario);

module.exports = router;