//El controller valida y agrupa las filas de la consulta en pedidos con sus productos
const pedidoService = require('../services/pedido.service');
const productoService = require('../services/producto.service');
const validadores = require('../config/validadores');
const datosTienda = require('../config/tienda');
const { ErrorApp } = require('../models/errorApp.model');
const { PedidoAdmin } = require('../models/pedidoAdmin.model');
const { PedidoCliente } = require('../models/pedidoCliente.model');

// Completa cada pedido con los datos de la tienda y con sus productos, uno por uno
function completarPedidos(pedidos, indice, callback) {
    if (indice >= pedidos.length) {//Condicion base, esto es una funcion recursiva
        callback(null, pedidos);
        return;
    }
    const pedido = pedidos[indice];//obtenemos un pedido de nuestra lista, con el indice que actualmente estemos iterando
    productoService.obtenerProductosDeVenta(pedido.idVenta, (error, productos) => {
        if (error) {//Si al tratar de obtener los detalles de un producto de venta nos da error, directamente cancelamos todo el proceso y mandamos a error
            callback(error, null);
            return;
        }
        pedido.productos = productos;
        Object.assign(pedido, datosTienda);//Esto permite asignar valores directamente a un objeto de otro objeto si las propiedades poseen el mismo nombre
        completarPedidos(pedidos, indice + 1, callback);
    });
}

//Esta funcion regresa los pedidos en un formato adecuado para el Admin
function obtenerPedidosAdmin(callback){
    pedidoService.obtenerPedidos((error,resultado)=>{
        if(error){//Si el servicio nos da un error, debemos de notificarlo y regrearlo
            callback(new ErrorApp(500,'Error al consultar los pedidos'),null);
            return;
        }
        completarPedidos(resultado,0,(error,pedidos)=>{
            if(error){
                callback(new ErrorApp(500,'Error al consultar los pedidos'),null);
                return;
            }
            callback(null,pedidos.map(pedido=>new PedidoAdmin(
                pedido.idVenta, pedido.fechaCompra, pedido.totalPagado, pedido.entregado, pedido.cancelado,
                pedido.nombreCliente, pedido.apellidoCliente, pedido.productos
            )))
        })
    })
}

//Esta funcion regresa los pedidos en un formato adecuado para el Cliente que hace la consulta
function obtenerPedidosCliente(idUsuario, callback) {
    if (!validadores.esUuidValido(idUsuario)) {
        callback(new ErrorApp(400, 'El id del usuario no es válido'), null);
        return;
    }
    pedidoService.obtenerPedidosCliente(idUsuario, (error, pedidos) => {
        if (error) {//Si el servicio nos da un error, debemos de notificarlo y regrearlo
            callback(new ErrorApp(500, 'Error al consultar tus pedidos'), null);
            return;
        }
        completarPedidos(pedidos, 0, (error, pedidosCompletos) => {
            if (error) {
                callback(new ErrorApp(500, 'Error al consultar tus pedidos'), null);
                return;
            }
            callback(null, pedidosCompletos.map(pedido=>new PedidoCliente(
                pedido.idVenta, pedido.fechaCompra, pedido.totalPagado, pedido.entregado, pedido.cancelado,
                pedido.rfcCliente, pedido.nombreCliente, pedido.apellidoCliente,
                datosTienda.nombreTienda, datosTienda.rfcTienda, datosTienda.telefonoTienda,
                datosTienda.domicilioFiscalTienda, datosTienda.regimenFiscalTienda, pedido.productos
            )));
        });
    });
}

// Regresa UN pedido del cliente. Solo busca entre los pedidos del propio cliente
function obtenerPedidoCliente(idUsuario, idVenta, callback) {
    //Aquí tenemos que validar los demás parametros usamos los validadores que definí previamente en config/validadores
    if (!validadores.esUuidValido(idUsuario)) {
        callback(new ErrorApp(400, 'El id del usuario no es válido'), null);
        return;
    }
    pedidoService.obtenerPedidoCliente(idUsuario,idVenta, (error, pedido) => {
        if (error) {//Si el servicio nos da un error, debemos de notificarlo y regrearlo
            callback(new ErrorApp(500, 'Error al consultar el pedido'), null);
            return;
        }
        if (!pedido) {//Si el pedido no existe o no es de este cliente, avisamos en lugar de seguir con un valor vacío
            callback(new ErrorApp(404, 'Pedido no encontrado'), null);
            return;
        }
        completarPedidos([pedido], 0, (error, pedidosCompletos) => {
            if (error) {
                callback(new ErrorApp(500, 'Error al consultar el pedido'), null);
                return;
            }
            const pedido=pedidosCompletos[0]
            callback(null,new PedidoCliente(
                pedido.idVenta, pedido.fechaCompra, pedido.totalPagado, pedido.entregado, pedido.cancelado,
                pedido.rfcCliente, pedido.nombreCliente, pedido.apellidoCliente,
                datosTienda.nombreTienda, datosTienda.rfcTienda, datosTienda.telefonoTienda,
                datosTienda.domicilioFiscalTienda, datosTienda.regimenFiscalTienda, pedido.productos
            ));
        });
    });
}
// Cambia el estado de entrega de un pedido (un solo endpoint hace el toggle entre entregado y pendiente)
function marcarEntregado(idVenta, entregado, callback) {
    //Aquí tenemos que validar los demás parametros usamos los validadores que definí previamente en config/validadores
    if (!validadores.esUuidValido(idVenta)) {
        callback(new ErrorApp(400, 'El id del pedido no es válido'), null);
        return;
    }
    if (typeof entregado !== 'boolean') {//Si es booleano de verdad, es correcto
        callback(new ErrorApp(400, 'El campo entregado debe ser true o false'), null);
        return;
    }
    pedidoService.marcarEntregado(idVenta, entregado, (error, resultado) => {
        if (error) {//Si el servicio nos da un error, debemos de notificarlo y regrearlo
            callback(new ErrorApp(500, 'Error al actualizar el pedido'), null);
            return;
        }
        if (resultado.affectedRows === 0) {//Si no se pudo hacer el proceso de update de
            callback(new ErrorApp(404, 'No existe ese pedido'), null);
            return;
        }
        callback(null, true);
    });
}

// Cambia el estado de un pedido entre cancelado y activo (mismo toggle que arriba)
function marcarCancelado(idVenta, cancelado, callback) {
    //Aquí tenemos que validar los demás parametros usamos los validadores que definí previamente en config/validadores
    if (!validadores.esUuidValido(idVenta)) {
        callback(new ErrorApp(400, 'El id del pedido no es válido'), null);
        return;
    }
    if (typeof cancelado !== 'boolean') {
        callback(new ErrorApp(400, 'El campo cancelado debe ser true o false'), null);
        return;
    }
    pedidoService.marcarCancelado(idVenta, cancelado, (error, resultado) => {
        if (error) {//Si el servicio nos da un error, debemos de notificarlo y regrearlo
            callback(new ErrorApp(500, 'Error al actualizar el pedido'), null);
            return;
        }
        if (resultado.affectedRows === 0) {
            callback(new ErrorApp(404, 'No existe ese pedido'), null);
            return;
        }
        callback(null, true);
    });
}
//Exportamos las funciones para que el router las pueda utilizar
module.exports = {
    obtenerPedidosAdmin,
    obtenerPedidosCliente,
    obtenerPedidoCliente,
    marcarEntregado,
    marcarCancelado,
};