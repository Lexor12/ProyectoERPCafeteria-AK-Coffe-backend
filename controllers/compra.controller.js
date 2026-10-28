//El controller arma las compras a proveedores: valida, abre la transacción y junta proveedor.service,
//compra.service, producto.service y productoProveedor.service, aqui o todo pasa junto o no pasa nada
const crypto = require('crypto');
const proveedorService = require('../services/proveedor.service');
const compraService = require('../services/compra.service');
const productoService = require('../services/producto.service');
const productoProveedorService = require('../services/productoProveedor.service');
const transaccionService = require('../services/transaccion.service');
const validadores = require('../config/validadores');
const { ErrorApp } = require('../models/errorApp.model');
const { RespuestaCompra } = require('../models/respuestaCompra.model');

//Permite surtir a un producto que ya existe, es decir que cuando hacemos la compra de este producto
function registrarCompraSurtirProducto(idProveedor, idProducto, cantidad, callback) {
    //Primero comprobamos que los parametros requeridos realmente tengan datos, si uno falta damos error
    if (!idProveedor || !idProducto || !cantidad) {
        callback(new ErrorApp(400, 'Faltan datos de la compra'), null);
        return;
    }
    //Ahora, para validar los demás parametros usamos los validadores que definí previamente en config/validadores
    if (!validadores.esUuidValido(idProveedor)) {//Validamos que el UUID que estamos mandando sea adecuada
        callback(new ErrorApp(400, 'El id del proveedor no es válido'), null);
        return;
    }
    if (!validadores.esUuidValido(idProducto)) {//Validamos que el UUID que estamos mandando sea adecuada
        callback(new ErrorApp(400, 'El id del producto no es válido'), null);
        return;
    }
    if (!validadores.esEnteroPositivoValido(cantidad)) {//Validamos que estemos mandando un valor de cantidad positivo y entero
        callback(new ErrorApp(400, 'La cantidad debe ser un número entero mayor a 0'), null);
        return;
    }
    //Convertimos de string a numerico para poder hacer calculos y procesamiento
    const cantidadNumero = Number(cantidad);

    transaccionService.iniciarTransaccion((error, conexion) => {
        if (error) {//Si el servicio nos da un error, debemos de notificarlo y regrearlo
            callback(new ErrorApp(500, 'Error al registrar la compra'), null);
            return;
        }
        // El proveedor debe existir y estar activo, en caso de que no lo este
        proveedorService.obtenerProveedorPorId(conexion, idProveedor, (error, proveedor) => {
            if (error) {//Si el servicio nos da un error, debemos de notificarlo y regrearlo, además de cancelar la transacción
                transaccionService.cancelarTransaccion(conexion);
                callback(new ErrorApp(500, 'Error al registrar la compra'), null);
                return;
            }
            if (!proveedor || !proveedor.activo) {
                transaccionService.cancelarTransaccion(conexion);
                callback(new ErrorApp(404,'El proveedor no existe o está desactivado'),null);
                return;
            }
            
            productoProveedorService.obtenerPrecioCompra(conexion,idProveedor,idProducto,(error,precio)=>{
                if(error){
                    transaccionService.cancelarTransaccion(conexion);
                    callback(new ErrorApp(500, 'Error al registrar la compra'), null);
                    return;
                }
                if (precio === null) {
                    transaccionService.cancelarTransaccion(conexion);
                    callback(new ErrorApp(404, 'El producto no está asociado a este proveedor'), null);
                    return;
                }
                const idCompra = crypto.randomUUID();//Generamos el id aquí, así no hay que adivinar cuál fue la última compra insertada
                const total = Math.round((cantidadNumero * precio) * 100) / 100;;
                
                compraService.insertarCompra(conexion, idCompra, idProveedor, total, (error) => {
                if (error) {//Como estamos dentro de una transacción, si tenemos un error debemos de cancelar toda la transacción y todos los procesos realizados
                    transaccionService.cancelarTransaccion(conexion);
                    callback(new ErrorApp(500, 'Error al registrar la compra'), null);
                    return;
                }
                compraService.insertarDetalleCompra(conexion, idCompra, idProducto, cantidadNumero, precio, (error) => {
                    if (error) {//Como estamos dentro de una transacción, si tenemos un error debemos de cancelar toda la transacción y todos los procesos realizados
                        if (error.code === 'ER_NO_REFERENCED_ROW_2') {//El producto no existe
                            transaccionService.cancelarTransaccion(conexion);
                            callback(new ErrorApp(404, 'El producto no existe'), null);
                            return;
                        }
                        transaccionService.cancelarTransaccion(conexion);
                        callback(new ErrorApp(500, 'Error al registrar la compra'), null);
                        return;
                    }
                    productoService.aumentarStock(conexion, idProducto, cantidadNumero, (error) => {
                        if (error) {//Como estamos dentro de una transacción, si tenemos un error debemos de cancelar toda la transacción y todos los procesos realizados
                            transaccionService.cancelarTransaccion(conexion);
                            callback(new ErrorApp(500, 'Error al registrar la compra'), null);
                            return;
                        }
                        //Si todas las consultas a las bases de datos usando los services son completadas, efectuamos la transacción para ya aplicar todo
                        transaccionService.confirmarTransaccion(conexion, (error) => {
                            if (error) {//Como estamos dentro de una transacción, si tenemos un error debemos de cancelar toda la transacción y todos los procesos realizados
                                callback(new ErrorApp(500, 'Error al registrar la compra'), null);
                                return;
                            }
                            //Devolvemos la respuesta de compra con los datos como validación
                            callback(null, new RespuestaCompra(true, undefined, idCompra, total));
                        });
                    });
                });
            });
            })
            
        });
    });
}

/*
Registra un producto nuevo desde un proveedor, lo crea con stock en 0 y usa el mismo precio que se le compra al
proveedor como precio de venta (después el admin lo puede ajustar desde Inventario, sin que eso afecte el precio de compra),
y lo asocia a ese proveedor. Aquí NO se registra ninguna compra ni se da stock, eso se hace después con un "Surtir" normal
*/
//La razón por la cual deje esto aqui, es que antes yo tenia que cuando creabas un producto, como asociado a un proveedor
//pues idealmente podrias ya tener "un gasto", actualmente lo deje aqui para "expandir a futuro", donde actualmente no esta implementando
//pero en un futuro si se desea que al momento de asociar un producto se defina un stock (por defecto) como de "comprado" este valor tambíen se guarde ya como
//detalle de compra
function registrarCompraProductoNuevo(idProveedor, nombre, descripcion, costoUnitario, callback) {
    //Primero comprobamos que los parametros requeridos realmente tengan datos, si uno falta damos error
    if (!idProveedor || !nombre || !costoUnitario) {
        callback(new ErrorApp(400, 'Faltan datos del producto o la compra'), null);
        return;
    }
    //Ahora, para validar los demás parametros usamos los validadores que definí previamente en config/validadores
    if (!validadores.esUuidValido(idProveedor)) {
        callback(new ErrorApp(400, 'El id del proveedor no es válido'), null);
        return;
    }
    if (!validadores.esLongitudValida(nombre, 3, 80)) {
        callback(new ErrorApp(400, 'El nombre del producto debe tener entre 3 y 80 caracteres'), null);
        return;
    }
    if (!validadores.esLongitudValida(descripcion, 1, 300)) {
        callback(new ErrorApp(400, 'La descripción es obligatoria y tiene un máximo de 300 caracteres'), null);
        return;
    }
    if (!validadores.esDecimalPositivoValido(costoUnitario)) {
        callback(new ErrorApp(400, 'El costo unitario debe ser un decimal mayor a 0'), null);
        return;
    }
    const costoNumero = Number(costoUnitario);

    transaccionService.iniciarTransaccion((error, conexion) => {
        if (error) {//Si el servicio nos da un error, debemos de notificarlo y regrearlo
            callback(new ErrorApp(500, 'Error al registrar el producto'), null);
            return;
        }
        proveedorService.obtenerProveedorPorId(conexion, idProveedor, (error, proveedor) => {
            if (error) {//Como estamos dentro de una transacción, si tenemos un error debemos de cancelar toda la transacción y todos los procesos realizados
                transaccionService.cancelarTransaccion(conexion);
                callback(new ErrorApp(500, 'Error al registrar el producto'), null);
                return;
            }
            if (!proveedor || !proveedor.activo) {
                transaccionService.cancelarTransaccion(conexion);
                callback(new ErrorApp(404, 'El proveedor no existe o está desactivado'), null);
                return;
            }
            const idProducto = crypto.randomUUID();

            productoService.registrarProductoNuevoTransaccion(conexion, idProducto, nombre, descripcion, costoNumero, (error) => {
                if (error) {//Como estamos dentro de una transacción, si tenemos un error debemos de cancelar toda la transacción y todos los procesos realizados
                    if (error.code === 'ER_DUP_ENTRY') {//El nombre del producto es UNIQUE
                        transaccionService.cancelarTransaccion(conexion);
                        callback(new ErrorApp(409, 'Ya existe un producto con ese nombre'), null);
                        return;
                    }
                    transaccionService.cancelarTransaccion(conexion);
                    callback(new ErrorApp(500, 'Error al registrar el producto'), null);
                    return;
                }
                productoProveedorService.asociarProductoProveedorTransaccion(conexion, idProveedor, idProducto, costoNumero, (error) => {
                    if (error) {//Como estamos dentro de una transacción, si tenemos un error debemos de cancelar toda la transacción y todos los procesos realizados
                        transaccionService.cancelarTransaccion(conexion);
                        callback(new ErrorApp(500, 'Error al registrar el producto'), null);
                        return;
                    }
                    //Si todas las consultas a las bases de datos usando los services son completadas, efectuamos la transacción para ya aplicar todo
                    transaccionService.confirmarTransaccion(conexion, (error) => {
                        if (error) {
                            callback(new ErrorApp(500, 'Error al registrar el producto'), null);
                            return;
                        }
                        callback(null, new RespuestaCompra(true, idProducto));
                    });
                });
            });
        });
    });
}
//Exportamos las funciones para que el router las pueda utilizar
module.exports = {
    registrarCompraSurtirProducto,
    registrarCompraProductoNuevo,
};

