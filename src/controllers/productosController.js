const productosModel = require('../models/productosModel');

// Obtener todos los productos
exports.getAllProductos = (req, res) => {
  console.log('Obteniendo todos los productos...');
  
  productosModel.obtenerTodos((err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      return res.status(500).json({ 
        error: 'Error al obtener productos'
      });
    }
    console.log(`Se encontraron ${results.length} productos`);
    res.json(results);
  });
};

// Obtener un producto por ID
exports.getProducto = (req, res) => {
  const id = req.params.id;
  console.log('Buscando producto con ID:', id);
  
  if (!id) {
    return res.status(400).json({ error: 'ID de producto requerido' });
  }

  productosModel.obtenerPorId(id, (err, results) => {
    if (err) {
      console.error('Error al obtener el producto:', err);
      return res.status(500).json({ 
        error: 'Error al obtener el producto'
      });
    }
    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    console.log('Producto encontrado:', results[0]);
    res.json(results[0]);
  });
};

// Crear un nuevo producto
exports.createProducto = (req, res) => {
  console.log('Creando nuevo producto:', req.body);
  const { nombre, descripcion, precio } = req.body;

  // Validaciones
  if (!nombre || !descripcion || !precio) {
    return res.status(400).json({ 
      error: 'Datos incompletos',
      requeridos: {
        nombre: !nombre,
        descripcion: !descripcion,
        precio: !precio
      }
    });
  }

  if (isNaN(precio) || precio <= 0) {
    return res.status(400).json({ error: 'El precio debe ser un número positivo' });
  }

  const producto = { nombre, descripcion, precio };

  productosModel.crear(producto, (err, result) => {
    if (err) {
      console.error('Error al crear el producto:', err);
      return res.status(500).json({ 
        error: 'Error al crear el producto',
        detalles: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    console.log('Producto creado exitosamente:', { id: result.insertId, ...producto });
    res.status(201).json({ 
      mensaje: 'Producto creado exitosamente',
      producto: { id: result.insertId, ...producto }
    });
  });
};

// Actualizar un producto
exports.updateProducto = (req, res) => {
  const id = req.params.id;
  console.log('Actualizando producto con ID:', id, 'Datos:', req.body);
  const { nombre, descripcion, precio } = req.body;

  // Validaciones
  if (!id) {
    return res.status(400).json({ error: 'ID de producto requerido' });
  }

  if (!nombre && !descripcion && !precio) {
    return res.status(400).json({ error: 'No hay datos para actualizar' });
  }

  if (precio !== undefined && (isNaN(precio) || precio <= 0)) {
    return res.status(400).json({ error: 'El precio debe ser un número positivo' });
  }

  const producto = {};
  if (nombre) producto.nombre = nombre;
  if (descripcion) producto.descripcion = descripcion;
  if (precio) producto.precio = precio;

  productosModel.actualizar(id, producto, (err, result) => {
    if (err) {
      console.error('Error al actualizar el producto:', err);
      return res.status(500).json({ 
        error: 'Error al actualizar el producto',
        detalles: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    console.log('Producto actualizado exitosamente:', { id, ...producto });
    res.json({ 
      mensaje: 'Producto actualizado exitosamente',
      producto: { id, ...producto }
    });
  });
};

// Eliminar un producto
exports.deleteProducto = (req, res) => {
  const id = req.params.id;
  console.log('Eliminando producto con ID:', id);

  if (!id) {
    return res.status(400).json({ error: 'ID de producto requerido' });
  }

  productosModel.eliminar(id, (err, result) => {
    if (err) {
      console.error('Error al eliminar el producto:', err);
      return res.status(500).json({ 
        error: 'Error al eliminar el producto',
        detalles: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    console.log('Producto eliminado exitosamente');
    res.json({ mensaje: 'Producto eliminado exitosamente' });
  });
};

// Reordenar IDs de productos
exports.reorderIds = (req, res) => {
  productosModel.reordenarIds((err) => {
    if (err) {
      console.error('Error al reordenar los IDs:', err);
      return res.status(500).json({ 
        error: 'Error al reordenar los IDs',
        detalles: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    res.json({ mensaje: 'IDs reordenados exitosamente' });
  });
}; 