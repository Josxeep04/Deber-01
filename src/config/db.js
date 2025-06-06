const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tienda'
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos establecida correctamente');
});

// Manejar errores de conexión
db.on('error', (err) => {
  console.error('Error en la base de datos:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Conexión a la base de datos perdida. Reconectando...');
    db.connect((err) => {
      if (err) {
        console.error('Error al reconectar:', err);
      } else {
        console.log('Reconexión exitosa');
      }
    });
  } else {
    throw err;
  }
});

module.exports = db;


