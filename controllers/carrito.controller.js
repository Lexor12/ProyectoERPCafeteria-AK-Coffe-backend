//Antes tenia un service llamado productoPedido, pero, lo elimine, y la razon de esto es que el carrito simplemente se basa
//en consultar los productos actuales (es decir productos.service) y validar que los productos recibidos por el frontend
const productoService = require('../services/producto.service');
const validadores = require('../config/validadores');
const { unirUrlCompleta } = require('../config/imagen');
const { ErrorApp } = require('../models/errorApp.model');
const { ItemCarrito } = require('../models/itemCarrito.model');
const { ProductoCarrito } = require('../models/productoCarrito.model');
const { ResultadoValidacionCarrito } = require('../models/resultadoValidacionCarrito.model');

//Regresa los productos activos con stock disponible, para que el front arme el carrito.
function obtenerProductosCarrito(callback) {
    productoService.obtenerProductos((error, productos) => {//Solicitamos directamete los productos y los reenviamos (el catalogo disponible basicamente)
        if (error) {//Si el servicio nos da un error, debemos de notificarlo y regrearlo
            callback(new ErrorApp(500, 'Error al consultar el catálogo'), null);
            return;
        }
        //En caso de que todo salga bien, como esperamos un formato de producto para carrito directamente mandamis este valor
        const disponibles = productos.filter(producto => producto.stock > 0).map(producto => new ProductoCarrito(
                producto.idProducto, producto.nombre, producto.descripcion, producto.precio,
                producto.stock, unirUrlCompleta(producto.imagenUrl), 0));
        callback(null, disponibles);
    });
}

// Verifica que la cantidad solicitada de cada producto no exceda el stock disponible
// "items" es un arreglo [{ idProducto, cantidad }] que manda el front al momento de pagar
function validarDisponibilidad(items, callback) {
    //Primero verificamos que realmente se este mandando un arreglo, en caso de que no se mande o este vacio lo notificamos
    if (!Array.isArray(items) || items.length === 0) {
        callback(new ErrorApp(400, 'El carrito está vacío'), null);
        return;
    }
    for (const item of items) {//Aqui checamos todos los elementos, y comprobamos si son validos su formato (para evitar procesar datos no correctos)
        if (!item || !validadores.esUuidValido(item.idProducto)) {
            callback(new ErrorApp(400, 'Hay un producto con id inválido en el carrito'), null);
            return;
        }
        if (!validadores.esEnteroPositivoValido(item.cantidad)) {
            callback(new ErrorApp(400, 'La cantidad de cada producto debe ser un entero mayor a 0'), null);
            return;
        }
    }
    //En caso de que todo este bien de los elementos, ahora si procesamos todos los productos
    productoService.obtenerProductos((error, productos) => {
        if (error) {//Si el servicio nos da un error, debemos de notificarlo y regrearlo
            callback(new ErrorApp(500, 'Error al validar el carrito'), null);
            return;
        }
        //Un producto que no aparece en la lista (desactivado o inexistente) cuenta como stock 0
        const stockPorId = new Map(productos.map(producto => [producto.idProducto, producto.stock]));//Aqui obtenemos una lista producto/stock
        //Aqui guardamos todos los productos que fueron excedidos por el carrito, estos se mandan en el endpoint 
        const excedidos = items.filter(item => (stockPorId.get(item.idProducto) ?? 0) < Number(item.cantidad))
        .map(item => new ItemCarrito(item.idProducto, Number(item.cantidad)));
        callback(null, new ResultadoValidacionCarrito(excedidos.length === 0, excedidos));//Si no hubo excedidos manda true, en caso de que si manda false
    });
}
//Exportamos todas las funciones para que sean utilizadas por las rutas
module.exports = {
    obtenerProductosCarrito,
    validarDisponibilidad,
};