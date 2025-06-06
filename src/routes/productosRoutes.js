const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const auth = require('../middleware/auth');

// Rutas públicas
router.get('/', productosController.getAllProductos);
router.get('/:id', productosController.getProducto);

// Rutas protegidas (solo para administradores)
router.post('/', auth, productosController.createProducto);
router.put('/:id', auth, productosController.updateProducto);
router.delete('/:id', auth, productosController.deleteProducto);

// Ruta para reordenar IDs (protegida)
router.post('/reorder', auth, productosController.reorderIds);

module.exports = router;
