const express = require('express');
const router = express.Router();  // Usa express.Router()

// Importa el controlador de autenticación
const authController = require('../controllers/authController.js');

// Ruta para login
router.post('/login', authController.loginUsuario);

module.exports = router;