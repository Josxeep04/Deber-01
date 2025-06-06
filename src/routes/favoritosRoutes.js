const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const favoritosController = require('../controllers/favoritosController');

// Todas las rutas de favoritos requieren autenticación
router.use(auth);

// Obtener favoritos del usuario
router.get('/', favoritosController.obtenerFavoritos);

// Verificar si un producto es favorito
router.get('/:producto_id', favoritosController.esFavorito);

// Agregar un producto a favoritos
router.post('/agregar/:producto_id', favoritosController.agregarFavorito);

// Eliminar un producto de favoritos
router.delete('/:producto_id', favoritosController.eliminarFavorito);

module.exports = router; 