const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController.js');

router.post('/login', authController.loginUsuario);

module.exports = router;