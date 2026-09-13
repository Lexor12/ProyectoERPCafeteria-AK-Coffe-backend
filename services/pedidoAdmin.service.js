const db = require('../config/db');

// Esta funcion se encarga de traer todos los pedidos para un admin
// bajo un mismo idVenta, como este tipo de sentencia nos devuelve digamos todo
//en formato de tabla sin separaciones, requerimos la función de abajo que se encanrga
// de agrupar por cliente todo lo que son los pedidos
function obtenerPedidosAdmin(callback) {
    const sentencia = `
        SELECT
            v.id_venta AS idVenta,
            v.fecha AS fechaCompra,
            v.total_pagado AS totalPagado,
            v.entregado AS entregado,
            v.cancelado AS cancelado,
            u.nombre AS nombreCliente,
            u.apellido AS apellidoCliente,
            p.nombre AS nombreProducto,
            dv.cantidad AS cantidadProducto,
            dv.precio_unitario AS precioUnitarioProducto
        FROM Venta v
        JOIN Usuario u ON u.id_usuario = v.id_usuario
        JOIN Detalle_Venta dv ON dv.id_venta = v.id_venta
        JOIN Producto p ON p.id_producto = dv.id_producto
        ORDER BY v.fecha DESC, v.id_venta
    `;

    db.query(sentencia, (error, filas) => {
        if (error) {
            callback(error, null);
            return;
        }
        // Cada fila viene "aplanada" (una fila = un producto de una venta),
        // aquí las agrupamos para que cada venta sea un solo objeto con su arreglo de productos
        callback(null, agruparPedidosAdmin(filas));
    });
}
/*
Como los valores que nos devuelve son tipo "valores repetidos de datos de cliente", hechos en formato tabular
Para cada venta, pues nosotros lo que hacemos aqui abajo es simple, usamos un map, que es una estructura clave valor
la cual almacena por ID de venta, y por primera vez al iterar 1 fila de una venta distinta guarda sus datos basicos y el producto asociado
y si la proxima iteración es el mismo tipo de venta pero diferente producto pues solo carga el producto

Basicamente, esta función permite pasar de un formato tabla con gran repetición de datos y poco procesable
al formato que definí en models
*/
function agruparPedidosAdmin(filas) {
    const pedidosPorId = new Map();

    filas.forEach(fila => {
        if (!pedidosPorId.has(fila.idVenta)) {
            pedidosPorId.set(fila.idVenta, {
                idVenta: fila.idVenta,
                fechaCompra: fila.fechaCompra,
                totalPagado: Number(fila.totalPagado),
                entregado: !!fila.entregado,
                cancelado: !!fila.cancelado,
                nombreCliente: fila.nombreCliente,
                apellidoCliente: fila.apellidoCliente,
                productos: [],
            });
        }

        const cantidad = Number(fila.cantidadProducto);
        const precioUnitario = Number(fila.precioUnitarioProducto);

        pedidosPorId.get(fila.idVenta).productos.push({
            nombre: fila.nombreProducto,
            cantidad: cantidad,
            precioUnitario: precioUnitario,
            subtotal: cantidad * precioUnitario,
        });
    });
    return Array.from(pedidosPorId.values());
}

// Marca un pedido como entregado o pendiente, aqui se permite el agregar o un valor false o true para actuar como un switch
function marcarEntregado(idVenta, entregado, callback) {
    const sentencia = 'UPDATE Venta SET entregado = ? WHERE id_venta = ?';
    db.query(sentencia, [entregado, idVenta], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

// Marca un pedido como cancelado o activo, aqui pasa lo mismo que arriba, pero para identificar si un producto es cancelado o activo, es un "toggle"
function marcarCancelado(idVenta, cancelado, callback) {
    const sentencia = 'UPDATE Venta SET cancelado = ? WHERE id_venta = ?';
    db.query(sentencia, [cancelado, idVenta], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

module.exports = {
    obtenerPedidosAdmin,
    marcarEntregado,
    marcarCancelado,
};