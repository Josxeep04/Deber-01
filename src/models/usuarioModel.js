const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Asegúrate de poner aquí la contraseña que usas en MySQL Workbench
  database: 'tienda', // Corregido para coincidir con database.sql
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

class Usuario {
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM usuarios WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      throw new Error('Error al buscar usuario en la base de datos');
    }
  }

  static async create({ email, password, nombre, rol = 'usuario' }) {
    try {
      // Validar datos
      if (!email || !password || !nombre) {
        throw new Error('Faltan datos requeridos');
      }

      // Verificar si el usuario ya existe
      const existente = await this.findByEmail(email);
      if (existente) {
        throw new Error('El correo electrónico ya está registrado');
      }

      // Encriptar la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insertar usuario
      const [result] = await pool.execute(
        'INSERT INTO usuarios (email, password, nombre, rol) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, nombre, rol]
      );

      if (!result.insertId) {
        throw new Error('Error al crear el usuario');
      }

      // Obtener el usuario creado
      const [newUser] = await pool.execute(
        'SELECT id, email, nombre, rol FROM usuarios WHERE id = ?',
        [result.insertId]
      );

      if (!newUser || !newUser[0]) {
        throw new Error('Error al obtener el usuario creado');
      }

      return newUser[0];
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  static async comparePassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Error al comparar contraseñas:', error);
      throw new Error('Error al verificar la contraseña');
    }
  }
}

module.exports = Usuario; 