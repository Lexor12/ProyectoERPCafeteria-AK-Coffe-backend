DROP DATABASE IF EXISTS `ak_coffe`;
CREATE DATABASE `ak_coffe` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `ak_coffe`;
SET NAMES utf8mb4;

CREATE TABLE `Trabajador` (
    `id_trabajador` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `nombre` VARCHAR(50) NOT NULL,
    `apellido` VARCHAR(50) NOT NULL,
    `area` VARCHAR(100) NOT NULL,
    `rfc` VARCHAR(13) NOT NULL,
    `fecha_ingreso` DATETIME NOT NULL,
    `salario` DECIMAL(10,2) NOT NULL,
    `hora_entrada_turno` TIME NOT NULL,
    `hora_salida_turno` TIME NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT `chk_trabajador_nombre` CHECK (CHAR_LENGTH(TRIM(`nombre`)) >= 2 AND CHAR_LENGTH(TRIM(`apellido`)) >= 2),
    CONSTRAINT `chk_trabajador_rfc` CHECK (`rfc` REGEXP '^[A-Za-z0-9]{12,13}$'),
    CONSTRAINT `chk_trabajador_salario` CHECK (`salario` > 0),
    CONSTRAINT `chk_trabajador_turno` CHECK (`hora_salida_turno` > `hora_entrada_turno`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Asistencia` (
    `id_asistencia` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `id_trabajador` VARCHAR(36) NOT NULL,
    `fecha` DATE NOT NULL,
    `hora_entrada` TIME NOT NULL,
    `hora_salida` TIME,
    FOREIGN KEY (`id_trabajador`)
        REFERENCES `Trabajador`(`id_trabajador`),
    UNIQUE `uq_trabajador_dia` (`id_trabajador`, `fecha`),
    CONSTRAINT `chk_asistencia_horas` CHECK (`hora_salida` IS NULL OR `hora_salida` > `hora_entrada`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Proveedor` (
    `id_proveedor` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `nombre` VARCHAR(80) NOT NULL,
    `telefono` VARCHAR(10) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE `uq_proveedor_nombre` (`nombre`),
    CONSTRAINT `chk_proveedor_nombre` CHECK (CHAR_LENGTH(TRIM(`nombre`)) >= 3),
    CONSTRAINT `chk_proveedor_telefono` CHECK (`telefono` REGEXP '^[0-9]{10}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Compra` (
    `id_compra` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `id_proveedor` VARCHAR(36) NOT NULL,
    `fecha` DATETIME NOT NULL,
    `total` DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (`id_proveedor`)
        REFERENCES `Proveedor`(`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Producto` (
    `id_producto` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `nombre` VARCHAR(80) NOT NULL,
    `descripcion` VARCHAR(300) NOT NULL,
    `precio` DECIMAL(10,2) NOT NULL,
    `stock_actual` INT NOT NULL DEFAULT 0,
    `fecha_modificado` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_desactivado` DATETIME,
    `img_url` VARCHAR(500),
    `activo` BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE `uq_producto_nombre` (`nombre`),
    CONSTRAINT `chk_stock` CHECK (`stock_actual` >= 0),
    CONSTRAINT `chk_producto_precio` CHECK (`precio` > 0),
    CONSTRAINT `chk_producto_nombre` CHECK (CHAR_LENGTH(TRIM(`nombre`)) >= 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Catalogo_Proveedor` (
    `id_catalogo_proveedor` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `id_proveedor` VARCHAR(36) NOT NULL,
    `id_producto` VARCHAR(36) NOT NULL,
    `precio_compra` DECIMAL(10,2) NOT NULL,
    `fecha_modificado` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_producto`)
        REFERENCES `Producto`(`id_producto`),
    FOREIGN KEY (`id_proveedor`)
        REFERENCES `Proveedor`(`id_proveedor`),
    UNIQUE `uq_proveedor_producto` (`id_proveedor`, `id_producto`),
    CONSTRAINT `chk_catalogo_precio` CHECK (`precio_compra` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Rol` (
    `id_rol` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `nombre` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Detalle_Compra` (
    `id_detalle_compra` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `id_compra` VARCHAR(36) NOT NULL,
    `id_producto` VARCHAR(36) NOT NULL,
    `cantidad` INT NOT NULL,
    `costo_unitario` DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (`id_producto`)
        REFERENCES `Producto`(`id_producto`),
    FOREIGN KEY (`id_compra`)
        REFERENCES `Compra`(`id_compra`),
    CONSTRAINT `chk_detalle_compra_cantidad` CHECK (`cantidad` > 0),
    CONSTRAINT `chk_detalle_compra_costo` CHECK (`costo_unitario` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Usuario` (
    `id_usuario` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `correo` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `nombre` VARCHAR(50) NOT NULL,
    `apellido` VARCHAR(50) NOT NULL,
    `telefono` VARCHAR(10) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT TRUE,
    `id_rol` VARCHAR(36) NOT NULL,
    FOREIGN KEY (`id_rol`)
        REFERENCES `Rol`(`id_rol`),
    CONSTRAINT `chk_usuario_nombre` CHECK (CHAR_LENGTH(TRIM(`nombre`)) >= 2 AND CHAR_LENGTH(TRIM(`apellido`)) >= 2),
    CONSTRAINT `chk_usuario_telefono` CHECK (`telefono` REGEXP '^[0-9]{10}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Venta` (
    `id_venta` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `id_usuario` VARCHAR(36) NOT NULL,
    `fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `total_pagado` DECIMAL(10,2) NOT NULL,
    `RFC` VARCHAR(13),
    `entregado` BOOLEAN NOT NULL DEFAULT FALSE,
    `cancelado` BOOLEAN NOT NULL DEFAULT FALSE,
    `fecha_entrega` DATETIME NULL,
    `fecha_cancelacion` DATETIME NULL,
    FOREIGN KEY (`id_usuario`)
        REFERENCES `Usuario`(`id_usuario`),
    CONSTRAINT `chk_venta_total` CHECK (`total_pagado` > 0),
    CONSTRAINT `chk_venta_rfc` CHECK (`RFC` IS NULL OR `RFC` REGEXP '^[A-Za-z0-9]{12,13}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Detalle_Venta` (
    `id_detalle_venta` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `id_venta` VARCHAR(36) NOT NULL,
    `id_producto` VARCHAR(36) NOT NULL,
    `cantidad` INT NOT NULL,
    `precio_unitario` DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (`id_venta`)
        REFERENCES `Venta`(`id_venta`),
    FOREIGN KEY (`id_producto`)
        REFERENCES `Producto`(`id_producto`),
    CONSTRAINT `chk_detalle_venta_cantidad` CHECK (`cantidad` > 0),
    CONSTRAINT `chk_detalle_venta_precio` CHECK (`precio_unitario` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `Rol` (`nombre`)
VALUES
('administrador'),
('cliente');

INSERT INTO `Usuario` (`id_usuario`, `correo`, `password_hash`, `nombre`, `apellido`, `telefono`, `activo`, `id_rol`)
VALUES
(
    '70fa40b5-aef9-11f1-a32d-74d4dd09e8f8',
    'admin@admin.com',
    '$2b$10$enLTaRvUOYrU9SvQFDeXTOKUUC7wxMn8CmvJ/Zuma8dUIi3FvY8Dy',
    'lexor',
    'lexor',
    '3312345678',
    1,
    (SELECT `id_rol` FROM `Rol` WHERE `nombre` = 'administrador')
),
(
    '70fa4eb2-aef9-11f1-a32d-74d4dd09e8f8',
    'cliente@gmail.com',
    '$2b$10$nb23/rCWPSv4EWhnr2uR5..ZRwyxf3SkWO9lGQb98qn47HwUYZ8E.',
    'Juan',
    'Lopez',
    '3312345682',
    1,
    (SELECT `id_rol` FROM `Rol` WHERE `nombre` = 'cliente')
),
(
    '48087beb-bc76-11f1-98d5-74d4dd09e8f8',
    'juancho@gmail.com',
    '$2b$10$czIxM3bJPtQgyY9zXXYpm.MxW9cZilA/dd7kHx0yBrLoK1pR836mq',
    'Juan',
    'Cho',
    '2343434343',
    1,
    (SELECT `id_rol` FROM `Rol` WHERE `nombre` = 'cliente')
),
(
    'c0a77ef6-af3e-11f1-a32d-74d4dd09e8f8',
    'Jupelo@gmail.com',
    '$2b$10$QyXPVyO3N2ESafG9WmlCtOmr3zDEzDufoDKB/eXNy9KbqWqWshcPS',
    'Juan',
    'Perez Lopez',
    '8899887766',
    1,
    (SELECT `id_rol` FROM `Rol` WHERE `nombre` = 'cliente')
),
(
    'f8b98aa5-af3f-11f1-a32d-74d4dd09e8f8',
    'pedro@gmail.com',
    '$2b$10$MZi.HhaAaQ8piuhS/RaVu.7xnAbW//oKwlnAxr8bcoTNCC2OVa5Me',
    'Pedro',
    'De Santa Fe',
    '3344334433',
    1,
    (SELECT `id_rol` FROM `Rol` WHERE `nombre` = 'cliente')
);

INSERT INTO `Producto` (`id_producto`, `nombre`, `descripcion`, `precio`, `stock_actual`, `fecha_modificado`, `fecha_desactivado`, `img_url`, `activo`)
VALUES
('21674955-d8ec-4997-9b92-dd2f6f6e6475', 'Capuchino Premium', 'Espresso con leche texturizada al vapor y una capa de espuma cremosa', 300.00, 0, '2026-09-29 20:40:13', NULL, 'uploads/21674955-d8ec-4997-9b92-dd2f6f6e6475.png', 1),
('70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 'Cafe Americano', 'Bebida caliente preparada con espresso y agua caliente.', 80.00, 34, '2026-09-13 00:59:41', NULL, 'uploads/70f7f26c-aef9-11f1-a32d-74d4dd09e8f8.png', 1),
('70f81670-aef9-11f1-a32d-74d4dd09e8f8', 'Capuchino Clasico', 'Espresso con leche texturizada al vapor y una capa de espuma cremosa.', 58.50, 53, '2026-09-12 16:37:59', '2026-09-13 01:00:40', 'uploads/70f81670-aef9-11f1-a32d-74d4dd09e8f8.png', 0),
('70f820ea-aef9-11f1-a32d-74d4dd09e8f8', 'Matcha Latte', 'Bebida preparada con matcha y leche caliente con una textura suave y cremosa.', 125.00, 28, '2026-09-29 20:40:17', NULL, 'uploads/70f820ea-aef9-11f1-a32d-74d4dd09e8f8.png', 1),
('70f8215f-aef9-11f1-a32d-74d4dd09e8f8', 'Chocolate Caliente', 'Bebida caliente de chocolate con leche y espuma cremosa.', 55.00, 21, '2026-09-12 16:40:09', '2026-09-12 17:35:04', 'uploads/70f8215f-aef9-11f1-a32d-74d4dd09e8f8.png', 0),
('9f1c2a10-0001-4a6e-8b11-000000000001', 'Latte Vainilla', 'Espresso con leche caliente y un toque de jarabe de vainilla.', 65.00, 8, '2026-09-05 10:00:00', NULL, '', 1),
('9f1c2a10-0002-4a6e-8b11-000000000002', 'Mocha', 'Espresso con leche caliente, chocolate y espuma cremosa.', 62.00, 12, '2026-09-05 10:00:00', NULL, '', 1),
('9f1c2a10-0003-4a6e-8b11-000000000003', 'Latte Caramelo', 'Espresso con leche caliente y jarabe de caramelo.', 65.00, 9, '2026-09-05 10:00:00', NULL, '', 1),
('9f1c2a10-0004-4a6e-8b11-000000000004', 'Cafe Latte', 'Espresso combinado con leche caliente y una ligera capa de espuma.', 55.00, 14, '2026-09-06 11:00:00', NULL, '', 1),
('9f1c2a10-0005-4a6e-8b11-000000000005', 'Espresso', 'Cafe concentrado preparado mediante la extraccion de cafe molido a presion.', 40.00, 20, '2026-09-06 11:00:00', NULL, '', 1),
('9f1c2a10-0006-4a6e-8b11-000000000006', 'Americano Frio', 'Espresso combinado con agua fria y hielo.', 48.00, 15, '2026-09-06 11:00:00', NULL, '', 1);

INSERT INTO `Trabajador` (`id_trabajador`, `nombre`, `apellido`, `area`, `rfc`, `fecha_ingreso`, `salario`, `hora_entrada_turno`, `hora_salida_turno`, `activo`)
VALUES
('70fbb998-aef9-11f1-a32d-74d4dd09e8f8', 'Lexor', 'Lexor', 'Administracion', 'LELL900101AB1', '2025-01-15 08:00:00', 650.00, '08:00:00', '17:00:00', 1),
('70fbcdf3-aef9-11f1-a32d-74d4dd09e8f8', 'Carlos', 'Ramirez', 'Barra', 'RACR920305DE1', '2025-02-10 08:00:00', 1700.00, '07:00:00', '15:00:00', 0),
('70fbceec-aef9-11f1-a32d-74d4dd09e8f8', 'Sofia', 'Martinez', 'Barra', 'MASO940712GH1', '2025-03-05 08:00:00', 550.00, '08:00:00', '20:00:00', 1),
('7b08756d-1c47-47fb-acf3-3469b5dedea1', 'Juan', 'Cabrera', 'Limpieza', 'CAJU950101AB1', '2026-09-28 00:00:00', 450.00, '14:00:00', '17:00:00', 1),
('ecbc5bb4-aeff-11f1-a32d-74d4dd09e8f8', 'Juanito', 'López Alcantara', 'Caja', 'JQA900101AB1', '2026-09-01 00:00:00', 550.00, '08:00:00', '17:00:00', 1),
('fe99be40-aeff-11f1-a32d-74d4dd09e8f8', 'Roberto Juan', 'López', 'Caja', 'JDK900102AB1', '2026-09-02 00:00:00', 1000.00, '08:00:00', '17:00:00', 0);

INSERT INTO `Asistencia` (`id_asistencia`, `id_trabajador`, `fecha`, `hora_entrada`, `hora_salida`)
VALUES
('05ee711f-0c84-4a35-bc3b-00ddc3fc1ffd', '70fbb998-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-12', '08:00:00', '17:00:00'),
('2213b7ea-7d73-4451-ba68-e4bd2a912ab4', '70fbceec-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-26', '08:11:00', '20:00:00'),
('a66f8b6f-d5ca-4da9-8120-abaeb8c195c9', '70fbb998-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-11', '08:00:00', '17:00:00'),
('c3f70d01-02d7-42ff-bdfc-21a74aca6e5a', '70fbb998-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-09', '08:04:00', '17:10:00'),
('fc79a32a-dc8e-436c-bdc8-396f24e6968d', 'ecbc5bb4-aeff-11f1-a32d-74d4dd09e8f8', '2026-09-12', '09:00:00', '18:00:00'),
('ff930a86-b337-4159-9031-0a310ad7dae6', '70fbcdf3-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-12', '08:08:00', '17:00:00');


INSERT INTO `Proveedor` (`id_proveedor`, `nombre`, `telefono`, `activo`)
VALUES
('3240113d-af41-11f1-a32d-74d4dd09e8f8', 'Lexor Coffe', '3355221155', 1),
('70fcbc11-aef9-11f1-a32d-74d4dd09e8f8', 'Cafe Sierra', '3312456789', 1),
('70fccaef-aef9-11f1-a32d-74d4dd09e8f8', 'Distribuidora Central', '3334567890', 1),
('70fccd06-aef9-11f1-a32d-74d4dd09e8f8', 'Insumos del Valle', '3345678901', 1),
('775b0ca6-af00-11f1-a32d-74d4dd09e8f8', 'KW Products', '4433445566', 1);


INSERT INTO `Compra` (`id_compra`, `id_proveedor`, `fecha`, `total`)
VALUES
('70fe0e62-aef9-11f1-a32d-74d4dd09e8f8', '70fcbc11-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-01 09:30:00', 2220.00),
('70fe1d9c-aef9-11f1-a32d-74d4dd09e8f8', '70fccaef-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-03 10:00:00', 1550.00),
('c1a00000-0000-4000-8000-000000000001', '70fccd06-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-05 10:00:00', 846.00),
('c1a00000-0000-4000-8000-000000000002', '70fcbc11-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-06 11:00:00', 1010.00),
('12f282b9-c66b-460f-9a7a-91b06491ccbd', '70fcbc11-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-12 16:41:42', 66.00),
('75e6f321-1a3f-4000-ba92-2a65d91be29c', '70fcbc11-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-12 16:41:51', 112.00),
('841819e2-0e61-494f-98ec-e5a64bda2264', '70fccaef-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-12 16:41:58', 105.00),
('7484a168-ecc7-4f04-8fb4-ccc14d2f61ac', '70fccaef-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-12 16:42:04', 100.00),
('f3cc1530-3fee-47a3-b2a5-ee4cde607871', '775b0ca6-af00-11f1-a32d-74d4dd09e8f8', '2026-09-12 17:20:40', 25.00),
('abecc737-3f0c-4146-9a61-398d98f069b8', '775b0ca6-af00-11f1-a32d-74d4dd09e8f8', '2026-09-12 17:20:49', 75.00),
('92cc27d0-40b7-4371-a2e5-f5f126494e73', '775b0ca6-af00-11f1-a32d-74d4dd09e8f8', '2026-09-12 17:20:58', 25.00),
('f11531c3-661d-406e-b8ba-ea73ca09804b', '70fcbc11-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-13 00:42:35', 280.00),
('062acec3-5f2f-45a9-aa29-057b226732ef', '70fccaef-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-13 00:42:43', 525.00),
('3801e89e-0654-4328-95a6-a9dc3c8ab8c0', '70fcbc11-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-13 00:42:51', 220.00),
('e18db120-7735-445c-ab6c-165c7dfba4b8', '775b0ca6-af00-11f1-a32d-74d4dd09e8f8', '2026-09-13 00:43:06', 25.00),
('410e9797-7e0a-4c80-b906-c7aa40a44292', '70fcbc11-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-13 00:55:37', 330.00),
('3eda2e91-03c4-405a-a4bc-2b9d2dd2f369', '70fcbc11-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-13 00:55:39', 420.00),
('9441e269-c9ee-42f3-8f5a-29ab8ac2877d', '70fccaef-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-13 00:55:44', 700.00),
('b23fceb5-3dd4-4b5e-bbb3-32bd1849293f', '70fcbc11-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-13 00:55:47', 224.00),
('267a0ff4-8ed9-40fa-9be8-4a38d00fd9f5', '70fcbc11-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-13 00:55:51', 198.00),
('ae0c641c-20f3-4c97-b607-f2d35f294373', '70fcbc11-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-13 01:02:19', 264.00),
('1c6d4dcc-de38-4c25-af0e-786848c26838', '70fcbc11-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-29 13:05:16', 88.00),
('35c78cde-e81a-42ad-ba89-b10e6aa026e0', '3240113d-af41-11f1-a32d-74d4dd09e8f8', '2026-09-29 13:08:16', 6000.00),
('0ddedc5c-1327-4dc3-a714-ff9d4834ff1e', '70fcbc11-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-29 20:54:18', 110.00);

INSERT INTO `Catalogo_Proveedor` (`id_catalogo_proveedor`, `id_proveedor`, `id_producto`, `precio_compra`, `fecha_modificado`)
VALUES
('58c94a3a-af41-11f1-a32d-74d4dd09e8f8', '3240113d-af41-11f1-a32d-74d4dd09e8f8', '21674955-d8ec-4997-9b92-dd2f6f6e6475', 60.00, '2026-09-29 22:13:41'),
('71002603-aef9-11f1-a32d-74d4dd09e8f8', '70fcbc11-aef9-11f1-a32d-74d4dd09e8f8', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 22.00, '2026-09-29 22:13:41'),
('71002d5c-aef9-11f1-a32d-74d4dd09e8f8', '70fcbc11-aef9-11f1-a32d-74d4dd09e8f8', '70f81670-aef9-11f1-a32d-74d4dd09e8f8', 28.00, '2026-09-29 22:13:41'),
('71002f5d-aef9-11f1-a32d-74d4dd09e8f8', '70fccaef-aef9-11f1-a32d-74d4dd09e8f8', '70f820ea-aef9-11f1-a32d-74d4dd09e8f8', 35.00, '2026-09-29 22:13:41'),
('710030c9-aef9-11f1-a32d-74d4dd09e8f8', '70fccaef-aef9-11f1-a32d-74d4dd09e8f8', '70f8215f-aef9-11f1-a32d-74d4dd09e8f8', 25.00, '2026-09-29 22:13:41'),
('8203ff45-af00-11f1-a32d-74d4dd09e8f8', '775b0ca6-af00-11f1-a32d-74d4dd09e8f8', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 25.00, '2026-09-29 22:13:41'),
('99396cca-af41-11f1-a32d-74d4dd09e8f8', '3240113d-af41-11f1-a32d-74d4dd09e8f8', '70f820ea-aef9-11f1-a32d-74d4dd09e8f8', 40.00, '2026-09-29 22:13:41');

INSERT INTO `Catalogo_Proveedor` (`id_proveedor`, `id_producto`, `precio_compra`)
VALUES
('70fccd06-aef9-11f1-a32d-74d4dd09e8f8', '9f1c2a10-0001-4a6e-8b11-000000000001', 30.00),
('70fccd06-aef9-11f1-a32d-74d4dd09e8f8', '9f1c2a10-0002-4a6e-8b11-000000000002', 28.00),
('70fccd06-aef9-11f1-a32d-74d4dd09e8f8', '9f1c2a10-0003-4a6e-8b11-000000000003', 30.00),
('70fcbc11-aef9-11f1-a32d-74d4dd09e8f8', '9f1c2a10-0004-4a6e-8b11-000000000004', 25.00),
('70fcbc11-aef9-11f1-a32d-74d4dd09e8f8', '9f1c2a10-0005-4a6e-8b11-000000000005', 18.00),
('70fcbc11-aef9-11f1-a32d-74d4dd09e8f8', '9f1c2a10-0006-4a6e-8b11-000000000006', 20.00);

INSERT INTO `Detalle_Compra` (`id_detalle_compra`, `id_compra`, `id_producto`, `cantidad`, `costo_unitario`)
VALUES
('7102949d-aef9-11f1-a32d-74d4dd09e8f8', '70fe0e62-aef9-11f1-a32d-74d4dd09e8f8', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 50, 22.00),
('71029939-aef9-11f1-a32d-74d4dd09e8f8', '70fe0e62-aef9-11f1-a32d-74d4dd09e8f8', '70f81670-aef9-11f1-a32d-74d4dd09e8f8', 40, 28.00),
('7102cfa1-aef9-11f1-a32d-74d4dd09e8f8', '70fe1d9c-aef9-11f1-a32d-74d4dd09e8f8', '70f820ea-aef9-11f1-a32d-74d4dd09e8f8', 30, 35.00),
('7102d204-aef9-11f1-a32d-74d4dd09e8f8', '70fe1d9c-aef9-11f1-a32d-74d4dd09e8f8', '70f8215f-aef9-11f1-a32d-74d4dd09e8f8', 20, 25.00),
('219b24ad-aefb-11f1-a32d-74d4dd09e8f8', '12f282b9-c66b-460f-9a7a-91b06491ccbd', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 3, 22.00),
('270fccbf-aefb-11f1-a32d-74d4dd09e8f8', '75e6f321-1a3f-4000-ba92-2a65d91be29c', '70f81670-aef9-11f1-a32d-74d4dd09e8f8', 4, 28.00),
('2b28e0e0-aefb-11f1-a32d-74d4dd09e8f8', '841819e2-0e61-494f-98ec-e5a64bda2264', '70f820ea-aef9-11f1-a32d-74d4dd09e8f8', 3, 35.00),
('2efb26fa-aefb-11f1-a32d-74d4dd09e8f8', '7484a168-ecc7-4f04-8fb4-ccc14d2f61ac', '70f8215f-aef9-11f1-a32d-74d4dd09e8f8', 4, 25.00),
('93462d3f-af00-11f1-a32d-74d4dd09e8f8', 'f3cc1530-3fee-47a3-b2a5-ee4cde607871', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 1, 25.00),
('98d03811-af00-11f1-a32d-74d4dd09e8f8', 'abecc737-3f0c-4146-9a61-398d98f069b8', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 3, 25.00),
('9dc9649b-af00-11f1-a32d-74d4dd09e8f8', '92cc27d0-40b7-4371-a2e5-f5f126494e73', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 1, 25.00),
('4f414fbf-af3e-11f1-a32d-74d4dd09e8f8', 'f11531c3-661d-406e-b8ba-ea73ca09804b', '70f81670-aef9-11f1-a32d-74d4dd09e8f8', 10, 28.00),
('544d84ce-af3e-11f1-a32d-74d4dd09e8f8', '062acec3-5f2f-45a9-aa29-057b226732ef', '70f820ea-aef9-11f1-a32d-74d4dd09e8f8', 15, 35.00),
('58d50e8e-af3e-11f1-a32d-74d4dd09e8f8', '3801e89e-0654-4328-95a6-a9dc3c8ab8c0', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 10, 22.00),
('622a7a45-af3e-11f1-a32d-74d4dd09e8f8', 'e18db120-7735-445c-ab6c-165c7dfba4b8', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 1, 25.00),
('21cfc515-af40-11f1-a32d-74d4dd09e8f8', '410e9797-7e0a-4c80-b906-c7aa40a44292', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 15, 22.00),
('22f30e75-af40-11f1-a32d-74d4dd09e8f8', '3eda2e91-03c4-405a-a4bc-2b9d2dd2f369', '70f81670-aef9-11f1-a32d-74d4dd09e8f8', 15, 28.00),
('25a9af9a-af40-11f1-a32d-74d4dd09e8f8', '9441e269-c9ee-42f3-8f5a-29ab8ac2877d', '70f820ea-aef9-11f1-a32d-74d4dd09e8f8', 20, 35.00),
('2780c466-af40-11f1-a32d-74d4dd09e8f8', 'b23fceb5-3dd4-4b5e-bbb3-32bd1849293f', '70f81670-aef9-11f1-a32d-74d4dd09e8f8', 8, 28.00),
('2a0a4e09-af40-11f1-a32d-74d4dd09e8f8', '267a0ff4-8ed9-40fa-9be8-4a38d00fd9f5', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 9, 22.00),
('10f318f2-af41-11f1-a32d-74d4dd09e8f8', 'ae0c641c-20f3-4c97-b607-f2d35f294373', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 12, 22.00),
('b50305b4-bc38-11f1-98d5-74d4dd09e8f8', '1c6d4dcc-de38-4c25-af0e-786848c26838', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 4, 22.00),
('20359398-bc39-11f1-98d5-74d4dd09e8f8', '35c78cde-e81a-42ad-ba89-b10e6aa026e0', '21674955-d8ec-4997-9b92-dd2f6f6e6475', 100, 60.00),
('3cbb31c3-bc7a-11f1-98d5-74d4dd09e8f8', '0ddedc5c-1327-4dc3-a714-ff9d4834ff1e', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 5, 22.00);

INSERT INTO `Detalle_Compra` (`id_compra`, `id_producto`, `cantidad`, `costo_unitario`)
VALUES
('c1a00000-0000-4000-8000-000000000001', '9f1c2a10-0001-4a6e-8b11-000000000001', 8, 30.00),
('c1a00000-0000-4000-8000-000000000001', '9f1c2a10-0002-4a6e-8b11-000000000002', 12, 28.00),
('c1a00000-0000-4000-8000-000000000001', '9f1c2a10-0003-4a6e-8b11-000000000003', 9, 30.00),
('c1a00000-0000-4000-8000-000000000002', '9f1c2a10-0004-4a6e-8b11-000000000004', 14, 25.00),
('c1a00000-0000-4000-8000-000000000002', '9f1c2a10-0005-4a6e-8b11-000000000005', 20, 18.00),
('c1a00000-0000-4000-8000-000000000002', '9f1c2a10-0006-4a6e-8b11-000000000006', 15, 20.00);

INSERT INTO `Venta` (`id_venta`, `id_usuario`, `fecha`, `total_pagado`, `RFC`, `entregado`, `cancelado`, `fecha_entrega`, `fecha_cancelacion`)
VALUES
('6259e7e9-aefb-11f1-a32d-74d4dd09e8f8', '70fa4eb2-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-12 16:43:30', 348.00, NULL, 1, 0, '2026-09-12 17:20:00', NULL),
('366ae584-af02-11f1-a32d-74d4dd09e8f8', '70fa4eb2-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-12 17:32:23', 274.92, NULL, 1, 0, '2026-09-12 18:10:00', NULL),
('b90fc162-af11-11f1-a32d-74d4dd09e8f8', '70fa4eb2-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-12 19:23:25', 795.18, NULL, 1, 0, '2026-09-12 20:00:00', NULL),
('00a4cdf4-af19-11f1-a32d-74d4dd09e8f8', '70fa4eb2-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-12 20:15:31', 863.04, NULL, 1, 0, '2026-09-12 21:05:00', NULL),
('3ce8b37c-af3e-11f1-a32d-74d4dd09e8f8', '70fa4eb2-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-13 00:42:04', 642.64, NULL, 1, 0, '2026-09-13 01:15:00', NULL),
('d206006d-af3e-11f1-a32d-74d4dd09e8f8', 'c0a77ef6-af3e-11f1-a32d-74d4dd09e8f8', '2026-09-13 00:46:14', 3310.06, NULL, 1, 0, '2026-09-13 01:20:00', NULL),
('8531718f-af40-11f1-a32d-74d4dd09e8f8', 'f8b98aa5-af3f-11f1-a32d-74d4dd09e8f8', '2026-09-13 00:58:24', 406.00, 'KDSKFO0930J1A', 0, 1, NULL, '2026-09-13 01:05:00'),
('0e144fcf-bc3a-11f1-98d5-74d4dd09e8f8', '70fa4eb2-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-29 13:14:55', 3712.00, NULL, 0, 0, NULL, NULL),
('64328558-bc78-11f1-98d5-74d4dd09e8f8', '70fa4eb2-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-29 20:41:05', 36975.00, NULL, 0, 0, NULL, NULL),
('506c75fe-bc7a-11f1-98d5-74d4dd09e8f8', '70fa4eb2-aef9-11f1-a32d-74d4dd09e8f8', '2026-09-29 20:54:51', 464.00, NULL, 0, 0, NULL, NULL);

INSERT INTO `Detalle_Venta` (`id_detalle_venta`, `id_venta`, `id_producto`, `cantidad`, `precio_unitario`)
VALUES
('625ae62b-aefb-11f1-a32d-74d4dd09e8f8', '6259e7e9-aefb-11f1-a32d-74d4dd09e8f8', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 3, 45.00),
('625bb94e-aefb-11f1-a32d-74d4dd09e8f8', '6259e7e9-aefb-11f1-a32d-74d4dd09e8f8', '70f8215f-aef9-11f1-a32d-74d4dd09e8f8', 3, 55.00),
('366c1ba6-af02-11f1-a32d-74d4dd09e8f8', '366ae584-af02-11f1-a32d-74d4dd09e8f8', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 2, 60.00),
('366cfb9e-af02-11f1-a32d-74d4dd09e8f8', '366ae584-af02-11f1-a32d-74d4dd09e8f8', '70f81670-aef9-11f1-a32d-74d4dd09e8f8', 2, 58.50),
('b91039c8-af11-11f1-a32d-74d4dd09e8f8', 'b90fc162-af11-11f1-a32d-74d4dd09e8f8', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 5, 60.00),
('b9113645-af11-11f1-a32d-74d4dd09e8f8', 'b90fc162-af11-11f1-a32d-74d4dd09e8f8', '70f81670-aef9-11f1-a32d-74d4dd09e8f8', 3, 58.50),
('b91172bc-af11-11f1-a32d-74d4dd09e8f8', 'b90fc162-af11-11f1-a32d-74d4dd09e8f8', '70f820ea-aef9-11f1-a32d-74d4dd09e8f8', 3, 70.00),
('00a624fa-af19-11f1-a32d-74d4dd09e8f8', '00a4cdf4-af19-11f1-a32d-74d4dd09e8f8', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 5, 60.00),
('00a6a4f3-af19-11f1-a32d-74d4dd09e8f8', '00a4cdf4-af19-11f1-a32d-74d4dd09e8f8', '70f81670-aef9-11f1-a32d-74d4dd09e8f8', 4, 58.50),
('00a7c35e-af19-11f1-a32d-74d4dd09e8f8', '00a4cdf4-af19-11f1-a32d-74d4dd09e8f8', '70f820ea-aef9-11f1-a32d-74d4dd09e8f8', 3, 70.00),
('3cee6226-af3e-11f1-a32d-74d4dd09e8f8', '3ce8b37c-af3e-11f1-a32d-74d4dd09e8f8', '70f81670-aef9-11f1-a32d-74d4dd09e8f8', 4, 58.50),
('3cf0d4d0-af3e-11f1-a32d-74d4dd09e8f8', '3ce8b37c-af3e-11f1-a32d-74d4dd09e8f8', '70f820ea-aef9-11f1-a32d-74d4dd09e8f8', 2, 70.00),
('3cf1f1f6-af3e-11f1-a32d-74d4dd09e8f8', '3ce8b37c-af3e-11f1-a32d-74d4dd09e8f8', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 3, 60.00),
('d206b65b-af3e-11f1-a32d-74d4dd09e8f8', 'd206006d-af3e-11f1-a32d-74d4dd09e8f8', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 17, 60.00),
('d206fe62-af3e-11f1-a32d-74d4dd09e8f8', 'd206006d-af3e-11f1-a32d-74d4dd09e8f8', '70f820ea-aef9-11f1-a32d-74d4dd09e8f8', 17, 70.00),
('d207d347-af3e-11f1-a32d-74d4dd09e8f8', 'd206006d-af3e-11f1-a32d-74d4dd09e8f8', '70f81670-aef9-11f1-a32d-74d4dd09e8f8', 11, 58.50),
('8531f482-af40-11f1-a32d-74d4dd09e8f8', '8531718f-af40-11f1-a32d-74d4dd09e8f8', '70f820ea-aef9-11f1-a32d-74d4dd09e8f8', 5, 70.00),
('0e14b571-bc3a-11f1-98d5-74d4dd09e8f8', '0e144fcf-bc3a-11f1-98d5-74d4dd09e8f8', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 40, 80.00),
('64345345-bc78-11f1-98d5-74d4dd09e8f8', '64328558-bc78-11f1-98d5-74d4dd09e8f8', '70f820ea-aef9-11f1-a32d-74d4dd09e8f8', 15, 125.00),
('6434beb4-bc78-11f1-98d5-74d4dd09e8f8', '64328558-bc78-11f1-98d5-74d4dd09e8f8', '21674955-d8ec-4997-9b92-dd2f6f6e6475', 100, 300.00),
('506d58be-bc7a-11f1-98d5-74d4dd09e8f8', '506c75fe-bc7a-11f1-98d5-74d4dd09e8f8', '70f7f26c-aef9-11f1-a32d-74d4dd09e8f8', 5, 80.00);