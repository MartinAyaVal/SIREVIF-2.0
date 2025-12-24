// usuariosRoutes.js - VERSIÓN CORRECTA (CommonJS)
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuariosController.js');

// ⭐⭐ NO necesitas importar authMiddleware aquí
// El servicio de usuarios NO debe verificar tokens

// RUTAS ESPECÍFICAS primero
router.get('/health', (req, res) => {
    res.json({ 
        status: 'Servidor de usuarios corriendo correctamente',
        timestamp: new Date().toISOString()
    });
});

// Rutas con parámetros específicos
router.patch('/:id/estado', usuarioController.cambiarEstadoUsuario);

// Rutas con :id
router.get('/:id', usuarioController.getusuariosById);
router.put('/:id', usuarioController.updateusuario);
router.delete('/:id', usuarioController.deleteusuario);

// Rutas genéricas (al final)
router.get('/', usuarioController.getusuario);
router.post('/', usuarioController.createusuario);

module.exports = router;  // ← CommonJS export