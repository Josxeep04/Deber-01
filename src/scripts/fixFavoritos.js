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
    process.exit(1);
  }
  console.log('Conectado a la base de datos');
  
  // Primero, eliminar cualquier registro duplicado
  const deleteDuplicates = `
    DELETE f1 FROM favoritos f1
    INNER JOIN favoritos f2 
    WHERE f1.id > f2.id 
    AND f1.usuario_id = f2.usuario_id 
    AND f1.producto_id = f2.producto_id;
  `;
  
  db.query(deleteDuplicates, (err, result) => {
    if (err) {
      console.error('Error eliminando duplicados:', err);
      process.exit(1);
    }
    console.log('Duplicados eliminados:', result.affectedRows);
    
    // Verificar registros actuales
    db.query('SELECT * FROM favoritos ORDER BY usuario_id, producto_id', (err, rows) => {
      if (err) {
        console.error('Error consultando favoritos:', err);
        process.exit(1);
      }
      console.log('Registros actuales:', rows);
      
      // Cerrar conexión
      db.end();
    });
  });
}); 