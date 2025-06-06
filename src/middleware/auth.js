const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_temporal';

const auth = (req, res, next) => {
  try {
    // Obtener el token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No hay token de autenticación' });
    }

    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Agregar el usuario al objeto request
    req.usuario = decoded;
    
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = auth; 