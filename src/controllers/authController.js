const Usuario = require('../models/usuarioModel');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_temporal';

// Función para guardar una sesión en la base de datos
const guardarSesion = async (usuario_id, token) => {
  try {
    const fecha_expiracion = new Date();
    fecha_expiracion.setHours(fecha_expiracion.getHours() + 24); // 24 horas desde ahora
    
    const query = 'INSERT INTO sesiones_activas (usuario_id, token, fecha_expiracion) VALUES (?, ?, ?)';
    await db.query(query, [usuario_id, token, fecha_expiracion]);
  } catch (error) {
    console.error('Error al guardar sesión:', error);
    throw new Error('Error al guardar la sesión');
  }
};

// Función para verificar si un token está en la lista negra
const verificarTokenValido = async (token) => {
  try {
    const query = 'SELECT * FROM sesiones_activas WHERE token = ? AND fecha_expiracion > NOW()';
    const [results] = await db.query(query, [token]);
    return results.length > 0;
  } catch (error) {
    console.error('Error al verificar token:', error);
    throw new Error('Error al verificar el token');
  }
};

// Función para eliminar sesiones expiradas
const limpiarSesionesExpiradas = async () => {
  try {
    const query = 'DELETE FROM sesiones_activas WHERE fecha_expiracion <= NOW()';
    await db.query(query);
  } catch (error) {
    console.error('Error al limpiar sesiones:', error);
    // No lanzamos error aquí ya que es una operación de limpieza
  }
};

// Función para generar el token JWT
const generarToken = (usuario) => {
  return jwt.sign(
    { 
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

exports.registro = async (req, res) => {
  try {
    const { email, password, nombre } = req.body;

    // Validar datos requeridos
    if (!email || !password || !nombre) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'El formato del correo electrónico no es válido' 
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Crear nuevo usuario
    const usuario = await Usuario.create({
      email,
      password,
      nombre
    });

    // Generar token
    const token = generarToken(usuario);

    // Guardar sesión
    await guardarSesion(usuario.id, token);

    // Limpiar sesiones expiradas
    await limpiarSesionesExpiradas();

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    if (error.message.includes('ya está registrado')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ 
      error: 'Error al registrar el usuario',
      detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos requeridos
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'El correo electrónico y la contraseña son requeridos' 
      });
    }

    // Buscar usuario
    const usuario = await Usuario.findByEmail(email);
    if (!usuario) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Verificar contraseña
    const passwordValida = await Usuario.comparePassword(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Generar token
    const token = generarToken(usuario);

    // Guardar sesión
    await guardarSesion(usuario.id, token);

    // Limpiar sesiones expiradas
    await limpiarSesionesExpiradas();

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'Error al iniciar sesión',
      detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      // Eliminar la sesión de la base de datos
      const query = 'DELETE FROM sesiones_activas WHERE token = ?';
      await db.query(query, [token]);
    }
    
    res.json({ mensaje: 'Sesión cerrada exitosamente' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
};

// Middleware para verificar token
exports.verificarToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: 'Acceso denegado. Token no proporcionado' 
      });
    }

    // Verificar si el token es válido en la base de datos
    const tokenValido = await verificarTokenValido(token);
    if (!tokenValido) {
      return res.status(401).json({ 
        error: 'Token inválido o expirado' 
      });
    }

    const verificado = jwt.verify(token, JWT_SECRET);
    req.usuario = verificado;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    res.status(500).json({ error: 'Error al verificar el token' });
  }
}; 