const db = require('../config/db');

exports.obtenerTodos = callback => {
  db.query('SELECT * FROM productos ORDER BY id ASC', callback);
};

exports.obtenerPorId = (id, callback) => {
  db.query('SELECT * FROM productos WHERE id = ?', [id], callback);
};

exports.crear = (producto, callback) => {
  const { nombre, descripcion, precio } = producto;
  db.query('INSERT INTO productos (nombre, descripcion, precio) VALUES (?, ?, ?)', 
    [nombre, descripcion, precio], callback);
};

exports.actualizar = (id, datos, callback) => {
  const { nombre, descripcion, precio } = datos;
  db.query('UPDATE productos SET nombre = ?, descripcion = ?, precio = ? WHERE id = ?', 
    [nombre, descripcion, precio, id], callback);
};

exports.eliminar = (id, callback) => {
  db.query('DELETE FROM productos WHERE id = ?', [id], callback);
};

exports.reordenarIds = callback => {
  db.query('SET @count = 0; UPDATE productos SET id = @count:= @count + 1;', callback);
};
