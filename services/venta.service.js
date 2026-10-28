//const db = require('../config/db');
//Aquí no se requiere el uso de db, ya que las funciones reciben conexion, que basicamente es dada por la transaccion, para hacer todo en 1 misma, esto lo hace el controller
//Las validaciones y proceso varios se llevan a cabo en el controller
function insertarVenta(conexion, idVenta, idUsuario, totalPagado, rfcCliente, callback) {
    const sentencia = `
        INSERT INTO Venta (id_venta, id_usuario, total_pagado, RFC, entregado, cancelado)
        VALUES (?, ?, ?, ?, FALSE, FALSE)
    `;
    conexion.query(sentencia, [idVenta, idUsuario, totalPagado, rfcCliente], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}
//Las validaciones y proceso varios se llevan a cabo en el controller
function insertarDetalleVenta(conexion, idVenta, item, callback) {
    const sentencia = `
        INSERT INTO Detalle_Venta (id_venta, id_producto, cantidad, precio_unitario)
        VALUES (?, ?, ?, ?)
    `;
    conexion.query(sentencia, [idVenta, item.idProducto, item.cantidad, item.precioUnitario], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

// El "AND stock_actual >= ?" hace que MySQL solo descuente si todavía alcanza
function descontarStock(conexion, idProducto, cantidad, callback) {
    const sentencia = 'UPDATE Producto SET stock_actual = stock_actual - ? WHERE id_producto = ? AND stock_actual >= ?';
    conexion.query(sentencia, [cantidad, idProducto, cantidad], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

module.exports = {
    insertarVenta,
    insertarDetalleVenta,
    descontarStock,
};