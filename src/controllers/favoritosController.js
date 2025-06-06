const Favorito = require('../models/favoritoModel');

// Obtener todos los favoritos del usuario
exports.obtenerFavoritos = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const favoritos = await Favorito.obtenerPorUsuario(usuario_id);
    res.json(favoritos);
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
};

// Verificar si un producto es favorito
exports.esFavorito = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const producto_id = req.params.producto_id;
    const esFavorito = await Favorito.verificar(usuario_id, producto_id);
    res.json({ esFavorito });
  } catch (error) {
    console.error('Error al verificar favorito:', error);
    res.status(500).json({ error: 'Error al verificar favorito' });
  }
};

// Agregar un producto a favoritos
exports.agregarFavorito = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const producto_id = req.params.producto_id;
    const resultado = await Favorito.agregar(usuario_id, producto_id);
    
    if (resultado.yaExiste) {
      return res.status(200).json({ 
        mensaje: 'El producto ya está en favoritos',
        yaExiste: true 
      });
    }

    res.json({ 
      mensaje: 'Producto agregado a favoritos',
      yaExiste: false 
    });
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    res.status(500).json({ error: 'Error al agregar favorito' });
  }
};

// Eliminar un producto de favoritos
exports.eliminarFavorito = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const producto_id = req.params.producto_id;
    
    // Verificar si existe antes de eliminar
    const existe = await Favorito.verificar(usuario_id, producto_id);
    if (!existe) {
      return res.status(404).json({ 
        error: 'El producto no está en favoritos',
        eliminado: false
      });
    }

    const resultado = await Favorito.eliminar(usuario_id, producto_id);
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'No se pudo eliminar el favorito',
        eliminado: false
      });
    }

    res.json({ 
      mensaje: 'Producto eliminado de favoritos',
      eliminado: true
    });
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    res.status(500).json({ error: 'Error al eliminar favorito' });
  }
}; 