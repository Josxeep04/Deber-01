const db = require('../config/db');

class Favorito {
  static obtenerPorUsuario(usuario_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT DISTINCT f.*, p.nombre, p.descripcion, p.precio 
        FROM favoritos f 
        JOIN productos p ON f.producto_id = p.id 
        WHERE f.usuario_id = ?
      `;
      
      db.query(query, [usuario_id], (err, results) => {
        if (err) {
          console.error('Error en Favorito.obtenerPorUsuario:', err);
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  static verificar(usuario_id, producto_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT COUNT(*) as count FROM favoritos WHERE usuario_id = ? AND producto_id = ?',
        [usuario_id, producto_id],
        (err, results) => {
          if (err) {
            console.error('Error en Favorito.verificar:', err);
            return reject(err);
          }
          resolve(results[0].count > 0);
        }
      );
    });
  }

  static verificarProductoExiste(producto_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT COUNT(*) as count FROM productos WHERE id = ?',
        [producto_id],
        (err, results) => {
          if (err) {
            console.error('Error en Favorito.verificarProductoExiste:', err);
            return reject(err);
          }
          resolve(results[0].count > 0);
        }
      );
    });
  }

  static async agregar(usuario_id, producto_id) {
    try {
      // Primero verificamos si ya existe
      const existe = await this.verificar(usuario_id, producto_id);
      if (existe) {
        return { yaExiste: true };
      }

      // Si hay registros duplicados, los eliminamos primero
      await new Promise((resolve, reject) => {
        db.query(
          'DELETE FROM favoritos WHERE usuario_id = ? AND producto_id = ?',
          [usuario_id, producto_id],
          (err) => {
            if (err) {
              console.error('Error al limpiar duplicados:', err);
              return reject(err);
            }
            resolve();
          }
        );
      });

      // Ahora agregamos el nuevo registro
      return new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO favoritos (usuario_id, producto_id) VALUES (?, ?)',
          [usuario_id, producto_id],
          (err, result) => {
            if (err) {
              // Si es un error de duplicado, lo manejamos como "ya existe"
              if (err.code === 'ER_DUP_ENTRY') {
                return resolve({ yaExiste: true });
              }
              console.error('Error en Favorito.agregar:', err);
              return reject(err);
            }
            resolve({ yaExiste: false, result });
          }
        );
      });
    } catch (error) {
      throw error;
    }
  }

  static async eliminar(usuario_id, producto_id) {
    try {
      // Primero verificamos si existe
      const existe = await this.verificar(usuario_id, producto_id);
      if (!existe) {
        return { affectedRows: 0 };
      }

      return new Promise((resolve, reject) => {
        db.query(
          'DELETE FROM favoritos WHERE usuario_id = ? AND producto_id = ?',
          [usuario_id, producto_id],
          (err, result) => {
            if (err) {
              console.error('Error en Favorito.eliminar:', err);
              return reject(err);
            }
            resolve(result);
          }
        );
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Favorito; 