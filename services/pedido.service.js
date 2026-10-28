const db = require('../config/db');
const { Pedido } = require('../models/pedido.model');

//Esta funcion retorna absolutamente todos los pedidos,esta es usada por el administrador para poder ver los pedidos de todos
function obtenerPedidos(callback){
    const sentencia = `
        SELECT
            v.id_venta AS idVenta,
            v.fecha AS fechaCompra,
            v.total_pagado AS totalPagado,
            v.entregado AS entregado,
            v.cancelado AS cancelado,
            v.RFC AS rfcCliente,
            u.nombre AS nombreCliente,
            u.apellido AS apellidoCliente
        FROM Venta v
        JOIN Usuario u ON u.id_usuario = v.id_usuario
        ORDER BY v.fecha DESC
    `;
    db.query(sentencia, (error, resultados) => {
        if (error) {//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error, null);
            return;
        }
        const pedidos=resultados.map(fila => new Pedido(
            fila.idVenta, fila.fechaCompra, Number(fila.totalPagado), !!fila.entregado, !!fila.cancelado,
            fila.rfcCliente || '', fila.nombreCliente, fila.apellidoCliente, []
        ))
        callback(null, pedidos);
    });
}


// Trae los pedidos de UN cliente específico del más reciente al antiguo
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
            u.apellido AS apellidoCliente
        FROM Venta v
        JOIN Usuario u ON u.id_usuario = v.id_usuario
        WHERE v.id_usuario = ?
        ORDER BY v.fecha DESC
    `;
    db.query(sentencia, [idUsuario], (error, resultados) => {
        if (error) {//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error, null);
            return;
        }
        const pedidos=resultados.map(fila => new Pedido(
            fila.idVenta, fila.fechaCompra, Number(fila.totalPagado), !!fila.entregado, !!fila.cancelado,
            fila.rfcCliente || '', fila.nombreCliente, fila.apellidoCliente, []
        ))
        callback(null, pedidos);
    });
}

//Esta funcion permite devolver todos de un pedido en especifico
function obtenerPedidoCliente(idUsuario,idVenta, callback) {
    const sentencia = `
        SELECT
            v.id_venta AS idVenta,
            v.fecha AS fechaCompra,
            v.total_pagado AS totalPagado,
            v.entregado AS entregado,
            v.cancelado AS cancelado,
            v.RFC AS rfcCliente,
            u.nombre AS nombreCliente,
            u.apellido AS apellidoCliente
        FROM Venta v
        JOIN Usuario u ON u.id_usuario = v.id_usuario
        WHERE v.id_usuario = ? AND v.id_venta=?
        
    `;

    db.query(sentencia, [idUsuario,idVenta], (error, resultados) => {
        if (error) {//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error, null);
            return;
        }
        const fila =resultados[0]
        if (!fila) {//En caso de que no exista y sea null mandamos a error
            callback(null, null);
            return;
        }
        callback(null, new Pedido(
            fila.idVenta, fila.fechaCompra, Number(fila.totalPagado), !!fila.entregado, !!fila.cancelado,
            fila.rfcCliente || '', fila.nombreCliente, fila.apellidoCliente, []
        ));
    });
}
// Marca un pedido como entregado o pendiente, aqui se permite el agregar o un valor false o true para actuar como un switch
function marcarEntregado(idVenta, entregado, callback) {
    const sentencia = 'UPDATE Venta SET entregado = ?, fecha_entrega = IF(?, NOW(), NULL) WHERE id_venta = ?';
    db.query(sentencia, [entregado,entregado, idVenta], (error, resultado) => {
        if (error) {//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            console.log(error)
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

// Marca un pedido como cancelado o activo, aqui pasa lo mismo que arriba, pero para identificar si un producto es cancelado o activo, es un "toggle"
function marcarCancelado(idVenta, cancelado, callback) {
    const sentencia = 'UPDATE Venta SET cancelado = ?, fecha_cancelacion = IF(?, NOW(), NULL) WHERE id_venta = ?';
    db.query(sentencia, [cancelado,cancelado, idVenta], (error, resultado) => {
        if (error) {
            console.log(error)
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}
module.exports = {
    obtenerPedidos,
    obtenerPedidosCliente,
    obtenerPedidoCliente,
    marcarEntregado,
    marcarCancelado,
};
