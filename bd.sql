CREATE TABLE `Trabajador` (
    `id_trabajador` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `nombre` VARCHAR(100) NOT NULL,
    `apellido` VARCHAR(100) NOT NULL,
    `area` VARCHAR(100) NOT NULL,
    `rfc` VARCHAR(13) NOT NULL,
    `fecha_ingreso` DATETIME NOT NULL,
    `salario` DECIMAL(10,2) NOT NULL,
    `hora_entrada_turno` TIME NOT NULL,
    `hora_salida_turno` TIME NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE `Asistencia` (
    `id_asistencia` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `id_trabajador` VARCHAR(36) NOT NULL,
    `fecha` DATETIME NOT NULL,
    `hora_entrada` TIME NOT NULL,
    `hora_salida` TIME,
    FOREIGN KEY (`id_trabajador`)
        REFERENCES `Trabajador`(`id_trabajador`)
);

CREATE TABLE `Proveedor` (
    `id_proveedor` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `nombre` VARCHAR(150) NOT NULL,
    `telefono` VARCHAR(20) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE `Compra` (
    `id_compra` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `id_proveedor` VARCHAR(36) NOT NULL,
    `fecha` DATETIME NOT NULL,
    `total` DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (`id_proveedor`)
        REFERENCES `Proveedor`(`id_proveedor`)
);

CREATE TABLE `Producto` (
    `id_producto` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `nombre` VARCHAR(150) NOT NULL,
    `descripcion` TEXT,
    `precio` DECIMAL(10,2) NOT NULL,
    `stock_actual` INT NOT NULL DEFAULT 0,
    `fecha_modificado` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_desactivado` DATETIME,
    `img_url` VARCHAR(500),
    `activo` BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE `Catalogo_Proveedor` (
    `id_catalogo_proveedor` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `id_proveedor` VARCHAR(36) NOT NULL,
    `id_producto` VARCHAR(36) NOT NULL,
    `precio_compra` DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (`id_producto`)
        REFERENCES `Producto`(`id_producto`),
    FOREIGN KEY (`id_proveedor`)
        REFERENCES `Proveedor`(`id_proveedor`),
    UNIQUE `uq_proveedor_producto` (`id_proveedor`, `id_producto`)
);

CREATE TABLE `Rol` (
    `id_rol` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `nombre` VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE `Detalle_Compra` (
    `id_detalle_compra` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `id_compra` VARCHAR(36) NOT NULL,
    `id_producto` VARCHAR(36) NOT NULL,
    `cantidad` INT NOT NULL,
    `costo_unitario` DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (`id_producto`)
        REFERENCES `Producto`(`id_producto`),
    FOREIGN KEY (`id_compra`)
        REFERENCES `Compra`(`id_compra`)
);

CREATE TABLE `Usuario` (
    `id_usuario` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `correo` VARCHAR(255) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `apellido` VARCHAR(100) NOT NULL,
    `telefono` VARCHAR(20),
    `activo` BOOLEAN NOT NULL DEFAULT TRUE,
    `id_rol` VARCHAR(36) NOT NULL,
    FOREIGN KEY (`id_rol`)
        REFERENCES `Rol`(`id_rol`)
);

CREATE TABLE `Venta` (
    `id_venta` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `id_usuario` VARCHAR(36) NOT NULL,
    `fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `total_pagado` DECIMAL(10,2) NOT NULL,
    `RFC` VARCHAR(13),
    `entregado` BOOLEAN NOT NULL DEFAULT FALSE,
    `cancelado` BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (`id_usuario`)
        REFERENCES `Usuario`(`id_usuario`)
);

CREATE TABLE `Detalle_Venta` (
    `id_detalle_venta` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `id_venta` VARCHAR(36) NOT NULL,
    `id_producto` VARCHAR(36) NOT NULL,
    `cantidad` INT NOT NULL,
    `precio_unitario` DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (`id_venta`)
        REFERENCES `Venta`(`id_venta`),
    FOREIGN KEY (`id_producto`)
        REFERENCES `Producto`(`id_producto`)
);


INSERT INTO `Rol` (`nombre`)
VALUES
('administrador'),
('cliente');

INSERT INTO `Producto` (`nombre`, `descripcion`, `precio`, `stock_actual`, `img_url`)
VALUES
('Cafe Americano', 'Bebida caliente preparada con espresso y agua caliente.', 45.00, 16, ''),
('Capuchino', 'Espresso con leche texturizada al vapor y una capa de espuma cremosa.', 58.50, 10, ''),
('Latte Vainilla', 'Espresso con leche caliente y un toque de jarabe de vainilla.', 65.00, 8, ''),
('Mocha', 'Espresso con leche caliente, chocolate y espuma cremosa.', 62.00, 12, ''),
('Latte Caramelo', 'Espresso con leche caliente y jarabe de caramelo.', 65.00, 9, ''),
('Cafe Latte', 'Espresso combinado con leche caliente y una ligera capa de espuma.', 55.00, 14, ''),
('Espresso', 'Cafe concentrado preparado mediante la extraccion de cafe molido a presion.', 40.00, 20, ''),
('Americano Frio', 'Espresso combinado con agua fria y hielo.', 48.00, 15, ''),
('Matcha Latte', 'Bebida preparada con matcha y leche caliente con una textura suave y cremosa.', 68.00, 7, ''),
('Chocolate Caliente', 'Bebida caliente de chocolate con leche y espuma cremosa.', 55.00, 11, '');

INSERT INTO `Usuario` (`correo`, `password_hash`, `nombre`, `apellido`, `telefono`, `id_rol`)
VALUES
(
    'admin@gmail.mx',
    'admin123',
    'admin',
    'admin',
    '3312345678',
    (SELECT `id_rol` FROM `Rol` WHERE `nombre` = 'administrador')
),
(
    'cliente@gmail.com',
    'cliente123',
    'Andrea',
    'Lopez',
    '3312345682',
    (SELECT `id_rol` FROM `Rol` WHERE `nombre` = 'cliente')
);

INSERT INTO `Trabajador` (`nombre`, `apellido`, `area`, `rfc`, `fecha_ingreso`, `salario`, `hora_entrada_turno`, `hora_salida_turno`)
VALUES
('admin', 'admin', 'Administracion', 'MACA900101ABC', '2025-01-15 08:00:00', 12500.00, '08:00:00', '16:00:00'),
('Carlos', 'Ramirez', 'Barra', 'RACR920305DEF', '2025-02-10 08:00:00', 9500.00, '07:00:00', '15:00:00'),
('Sofia', 'Martinez', 'Barra', 'MASO940712GHI', '2025-03-05 08:00:00', 9500.00, '12:00:00', '20:00:00');

INSERT INTO `Proveedor` (`nombre`, `telefono`)
VALUES
('Cafe Sierra', '3312456789'),
('Distribuidora Central', '3334567890'),
('Insumos del Valle', '3345678901');

INSERT INTO `Compra` (`id_proveedor`, `fecha`, `total`)
VALUES
(
    (SELECT `id_proveedor` FROM `Proveedor` WHERE `nombre` = 'Cafe Sierra'),
    '2026-09-01 09:30:00',
    2850.00
),
(
    (SELECT `id_proveedor` FROM `Proveedor` WHERE `nombre` = 'Distribuidora Central'),
    '2026-09-03 10:00:00',
    1940.00
);

INSERT INTO `Catalogo_Proveedor` (`id_proveedor`, `id_producto`, `precio_compra`)
VALUES
(
    (SELECT `id_proveedor` FROM `Proveedor` WHERE `nombre` = 'Cafe Sierra'),
    (SELECT `id_producto` FROM `Producto` WHERE `nombre` = 'Cafe Americano'),
    22.00
),
(
    (SELECT `id_proveedor` FROM `Proveedor` WHERE `nombre` = 'Cafe Sierra'),
    (SELECT `id_producto` FROM `Producto` WHERE `nombre` = 'Capuchino'),
    28.00
),
(
    (SELECT `id_proveedor` FROM `Proveedor` WHERE `nombre` = 'Distribuidora Central'),
    (SELECT `id_producto` FROM `Producto` WHERE `nombre` = 'Matcha Latte'),
    35.00
),
(
    (SELECT `id_proveedor` FROM `Proveedor` WHERE `nombre` = 'Distribuidora Central'),
    (SELECT `id_producto` FROM `Producto` WHERE `nombre` = 'Chocolate Caliente'),
    25.00
);

INSERT INTO `Detalle_Compra` (`id_compra`, `id_producto`, `cantidad`, `costo_unitario`)
VALUES
(
    (SELECT `id_compra` FROM `Compra` WHERE `fecha` = '2026-09-01 09:30:00'),
    (SELECT `id_producto` FROM `Producto` WHERE `nombre` = 'Cafe Americano'),
    50,
    22.00
),
(
    (SELECT `id_compra` FROM `Compra` WHERE `fecha` = '2026-09-01 09:30:00'),
    (SELECT `id_producto` FROM `Producto` WHERE `nombre` = 'Capuchino'),
    40,
    28.00
),
(
    (SELECT `id_compra` FROM `Compra` WHERE `fecha` = '2026-09-03 10:00:00'),
    (SELECT `id_producto` FROM `Producto` WHERE `nombre` = 'Matcha Latte'),
    30,
    35.00
),
(
    (SELECT `id_compra` FROM `Compra` WHERE `fecha` = '2026-09-03 10:00:00'),
    (SELECT `id_producto` FROM `Producto` WHERE `nombre` = 'Chocolate Caliente'),
    20,
    25.00
);