const db = require('../config/db');
const datosTienda = require('../config/tienda');

// Trae los pedidos de UN cliente específico, con sus productos agrupados
/*
ACLARACIÓN, en un futuro cuando el endpoint reciva el token y lo descomponga,
esta función será llamada con el id del cliente que hace la consulta, el endpoint no solicita id
se usa por default el del usuario, no debe permitirse a otro usuario ver los pedidos de otro usuario
*/
function obtenerPedidosCliente(idUsuario, callback) {
    const sentencia = `
        SELECT
            v.id_venta AS idVenta,
            v.fecha AS fechaCompra,
            v.total_pagado AS totalPagado,
            v.entregado AS entregado,
            v.cancelado AS cancelado,
            v.RFC AS rfcCliente,
            u.nombre AS nombreCliente,
            u.apellido AS apellidoCliente,
            p.nombre AS nombreProducto,
            dv.cantidad AS cantidadProducto,
            dv.precio_unitario AS precioUnitarioProducto
        FROM Venta v
        JOIN Usuario u ON u.id_usuario = v.id_usuario
        JOIN Detalle_Venta dv ON dv.id_venta = v.id_venta
        JOIN Producto p ON p.id_producto = dv.id_producto
        WHERE v.id_usuario = ?
        ORDER BY v.fecha DESC, v.id_venta
    `;

    db.query(sentencia, [idUsuario], (error, filas) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, agruparPedidosCliente(filas));
    });
}

/*
Bueno, esta función hace lo mismo que explique en pedidoAdmin, pero como soy muy amable conmigo mismo del futuro aqui esta la explicacion:

Basicamente la consulta a la BD trae todo en un formato de Tabla con todo duplicado, y esta función se encarga de guardar todo en el objeto de PedidoCliente
pero bien, sin el formato engorroso de la BD que es muy poco procesable e independiente de todas las entidades
*/
function agruparPedidosCliente(filas) {
    const pedidosPorId = new Map();

    filas.forEach(fila => {
        if (!pedidosPorId.has(fila.idVenta)) {//La razón por la cual aquí pregunto por el ID, siendo que cualquiera diría algo como "Oye pero envés de hacer eso, desde antes asigna el ID de la persona que hace la consulta"
            //Y no esta mal pensar eso, pero la verdad es que para ahorrarme código copie y pegue el de admin y lo modifique
            pedidosPorId.set(fila.idVenta, {
                idVenta: fila.idVenta,
                fechaCompra: fila.fechaCompra,
                totalPagado: Number(fila.totalPagado),
                entregado: !!fila.entregado,
                cancelado: !!fila.cancelado,
                rfcCliente: fila.rfcCliente || '',
                nombreCliente: fila.nombreCliente,
                apellidoCliente: fila.apellidoCliente,
                ...datosTienda,
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

module.exports = {
    obtenerPedidosCliente,
};