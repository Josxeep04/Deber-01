const db = require('../config/db');

class Producto {
  static getAll(callback) {
    db.query('SELECT * FROM productos', (err, results) => {
      if (err) {
        console.error('Error en Producto.getAll:', err);
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  static getById(id, callback) {
    db.query('SELECT * FROM productos WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error en Producto.getById:', err);
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  static create(producto, callback) {
    const { nombre, descripcion, precio } = producto;
    db.query(
      'INSERT INTO productos (nombre, descripcion, precio) VALUES (?, ?, ?)',
      [nombre, descripcion, precio],
      (err, result) => {
        if (err) {
          console.error('Error en Producto.create:', err);
          return callback(err, null);
        }
        callback(null, result);
      }
    );
  }

  static update(id, producto, callback) {
    const { nombre, descripcion, precio } = producto;
    const updates = [];
    const values = [];

    if (nombre) {
      updates.push('nombre = ?');
      values.push(nombre);
    }
    if (descripcion) {
      updates.push('descripcion = ?');
      values.push(descripcion);
    }
    if (precio) {
      updates.push('precio = ?');
      values.push(precio);
    }

    values.push(id);

    const query = `UPDATE productos SET ${updates.join(', ')} WHERE id = ?`;
    
    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error en Producto.update:', err);
        return callback(err, null);
      }
      callback(null, result);
    });
  }

  static delete(id, callback) {
    db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Error en Producto.delete:', err);
        return callback(err, null);
      }
      callback(null, result);
    });
  }

  // Método auxiliar para reordenar todos los IDs
  static reorderIds(callback) {
    db.query('SELECT id FROM productos ORDER BY id', (err, results) => {
      if (err) return callback(err);

      if (results.length === 0) return callback(null);

      let updates = results.map((row, index) => {
        const newId = index + 1;
        return new Promise((resolve, reject) => {
          if (row.id === newId) {
            resolve();
            return;
          }
          db.query('UPDATE productos SET id = ? WHERE id = ?', [newId, row.id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });

      Promise.all(updates)
        .then(() => callback(null))
        .catch(callback);
    });
  }
}

module.exports = Producto; 