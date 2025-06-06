const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para registro de usuarios
router.post('/registro', authController.registro);

// Ruta para login
router.post('/login', authController.login);

// Ruta para logout
router.post('/logout', authController.verificarToken, authController.logout);

module.exports = router; 