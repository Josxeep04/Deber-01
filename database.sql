-- Crear la base de datos
DROP DATABASE IF EXISTS tienda;
CREATE DATABASE tienda;
USE tienda_online;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rol ENUM('usuario', 'admin') DEFAULT 'usuario'
);

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de favoritos
CREATE TABLE IF NOT EXISTS favoritos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    producto_id INT NOT NULL,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorito (usuario_id, producto_id)
);

-- Crear tabla de sesiones activas
CREATE TABLE IF NOT EXISTS sesiones_activas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token (token(255)),
    INDEX idx_expiracion (fecha_expiracion)
);

-- Crear índices
CREATE INDEX idx_email ON usuarios(email);
CREATE INDEX idx_productos_nombre ON productos(nombre);

-- Insertar datos de ejemplo
INSERT INTO usuarios (email, password, nombre, rol) 
VALUES 
('admin@ejemplo.com', '$2a$10$XgPxE6YJn5xvZLR5JAHO5O.TMrhqbHhxUZ1BZE2H.FTTCJfqaFqPK', 'Administrador', 'admin')
ON DUPLICATE KEY UPDATE email=email;

-- Insertar algunos productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio) VALUES
('Producto 1', 'Descripción del producto 1', 99.99),
('Producto 2', 'Descripción del producto 2', 149.99),
('Producto 3', 'Descripción del producto 3', 199.99)
ON DUPLICATE KEY UPDATE nombre=nombre; 