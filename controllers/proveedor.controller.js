//El controller valida y aplica las reglas de los proveedores y de los productos que cada proveedor ofrece
const proveedorService = require('../services/proveedor.service');
const productoProveedorService = require('../services/productoProveedor.service');
const transaccionService = require('../services/transaccion.service');
const validadores = require('../config/validadores');
const { unirUrlCompleta } = require('../config/imagen');
const { ErrorApp } = require('../models/errorApp.model');

// Las mismas validaciones sirven para registrar y para editar
function validarDatosProveedor(nombre, telefono) {
    //Primero comprobamos que los parametros requeridos realmente tengan datos, si uno falta damos error
    if (!nombre || !telefono) {
        return new ErrorApp(400, 'Faltan datos del proveedor');
    }
    //Ahora, para validar los demás parametros usamos los validadores que definí previamente en config/validadores
    if (!validadores.esLongitudValida(nombre, 3, 80)) {
        return new ErrorApp(400, 'El nombre del proveedor debe tener entre 3 y 80 caracteres');
    }
    if (!validadores.esTelefonoValido(telefono)) {
        return new ErrorApp(400, 'El teléfono debe tener exactamente 10 dígitos');
    }
    return null;
}

function obtenerProveedores(callback) {
    proveedorService.obtenerProveedores((error, proveedores) => {
        if (error) {//Si el servicio nos da un error, debemos de notificarlo y regrearlo
            callback(new ErrorApp(500, 'Error al consultar proveedores'), null);
            return;
        }
        //Si el service responde correctamente mandamos los datos al router
        callback(null, proveedores);
    });
}

function registrarProveedor(nombre, telefono, callback) {
    const errorValidacion = validarDatosProveedor(nombre, telefono);
    if (errorValidacion) {
        callback(errorValidacion, null);
        return;
    }
    proveedorService.crearProveedor(nombre, telefono, (error) => {
        if (error) {//Si el servicio nos da un error, debemos de notificarlo y regrearlo
            if (error.code === 'ER_DUP_ENTRY') {//El nombre es unico, si en dado caso existe un proveedor con ese nombre retornamos error
                callback(new ErrorApp(409, 'Ya existe un proveedor con ese nombre'), null);
                return;
            }
            callback(new ErrorApp(500, 'Error al registrar el proveedor'), null);
            return;
        }
        callback(null, true);
    });
}

function editarProveedor(idProveedor, nombre, telefono, callback) {
    if (!validadores.esUuidValido(idProveedor)) {//Validamos que el UUID que estamos mandando sea adecuada
        callback(new ErrorApp(400, 'El id del proveedor no es válido'), null);
        return;
    }
    const errorValidacion = validarDatosProveedor(nombre, telefono);
    if (errorValidacion) {
        callback(errorValidacion, null);
        return;
    }
    proveedorService.editarProveedor(idProveedor, nombre, telefono, (error, resultado) => {
        if (error) {//Si el servicio nos da un error, debemos de notificarlo y regrearlo
            if (error.code === 'ER_DUP_ENTRY') {
                callback(new ErrorApp(409, 'Ya existe un proveedor con ese nombre'), null);
                return;
            }
            callback(new ErrorApp(500, 'Error al editar el proveedor'), null);
            return;
        }
        if (resultado.affectedRows === 0) {
            callback(new ErrorApp(404, 'Proveedor no encontrado'), null);
            return;
        }
        callback(null, true);
    });
}

// Desactiva al proveedor y, en la misma transacción, elimina sus asociaciones con productos
// Las dos cosas pasan juntas o no pasa ninguna; sus compras se conservan
function desactivarProveedor(idProveedor, callback) {
    if (!validadores.esUuidValido(idProveedor)) {//Validamos que el UUID que estamos mandando sea adecuado
        return new ErrorApp(400, 'El id del proveedor no es válido');
    }
    transaccionService.iniciarTransaccion((error, conexion) => {
        if (error) {//Si el servicio nos da un error, debemos de notificarlo y regrearlo
            callback(new ErrorApp(500, 'Error al desactivar el proveedor'), null);
            return;
        }
        proveedorService.desactivarProveedor(conexion, idProveedor, (error, resultado) => {
            if (error) {//Como estamos dentro de una transacción, si tenemos un error debemos de cancelar toda la transacción y todos los procesos realizados
                transaccionService.cancelarTransaccion(conexion);
                callback(new ErrorApp(500, 'Error al desactivar el proveedor'), null);
                return;
            }
            if (resultado.affectedRows === 0) {//Si no se efectuo la desactivación porque no se encontro el proveedor damos error
                transaccionService.cancelarTransaccion(conexion);
                callback(new ErrorApp(404, 'Proveedor no encontrado'), null);
                return;
            }
            productoProveedorService.eliminarAsociacionesDeProveedor(conexion, idProveedor, (error) => {
                if (error) {//Como estamos dentro de una transacción, si tenemos un error debemos de cancelar toda la transacción y todos los procesos realizados
                    transaccionService.cancelarTransaccion(conexion);
                    callback(new ErrorApp(500, 'Error al desactivar el proveedor'), null);
                    return;
                }
                transaccionService.confirmarTransaccion(conexion, (error) => {
                    if (error) {//Como estamos dentro de una transacción, si tenemos un error debemos de cancelar toda la transacción y todos los procesos realizados
                        callback(new ErrorApp(500, 'Error al desactivar el proveedor'), null);
                        return;
                    }
                    callback(null, true);
                });
            });
        });
    });
}

// Regresa los productos de TODOS los proveedores; a cada uno le pone la dirección completa de su imagen
function obtenerProductosProveedor(callback) {
    productoProveedorService.obtenerProductosProveedor((error, productos) => {
        if (error) {//Si el servicio nos da un error, debemos de notificarlo y regrearlo
            callback(new ErrorApp(500, 'Error al consultar los productos del proveedor'), null);
            return;
        }
        productos.forEach(producto => {
            producto.imagenUrl = unirUrlCompleta(producto.imagenUrl);
        });
        callback(null, productos);
    });
}

// Asocia un producto ya existente a un proveedor con su precio de compra
function asociarProductoProveedor(idProveedor, idProducto, precioCompra, callback) {
    //Aquí tenemos que validar los demás parametros usamos los validadores que definí previamente en config/validadores
    if (!validadores.esUuidValido(idProveedor)) {//Validamos que el UUID que estamos mandando sea adecuado
        return new ErrorApp(400, 'El id del proveedor no es válido');
    }
    if (!validadores.esUuidValido(idProducto)) {//Validamos que el UUID que estamos mandando sea adecuado
        callback(new ErrorApp(400, 'El id del producto no es válido'), null);
        return;
    }
    if (!validadores.esDecimalPositivoValido(precioCompra)) {
        callback(new ErrorApp(400, 'El precio de compra debe ser un decimal mayor a 0 con máximo 2 decimales'), null);
        return;
    }
    productoProveedorService.asociarProductoProveedor(idProveedor, idProducto, precioCompra, (error) => {
        if (error) {
            if (error.code === 'ER_DUP_ENTRY') {//Para cambiar el precio de una asociación existente se usa la edición, no volver a asociar
                callback(new ErrorApp(409, 'Este producto ya está asociado a este proveedor'), null);
                return;
            }
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {//El proveedor o el producto no existen
                callback(new ErrorApp(404, 'El proveedor o el producto no existe'), null);
                return;
            }
            callback(new ErrorApp(500, 'Error al asociar el producto al proveedor'), null);
            return;
        }
        callback(null, true);
    });
}

// Edita un producto desde el módulo de proveedores: nombre y descripción del producto y precio de compra de este proveedor
function editarProductoProveedor(idProductoProveedor, nombre, descripcion, precioUnitario, callback) {
    //Aquí tenemos que validar los demás parametros usamos los validadores que definí previamente en config/validadores
    if (!validadores.esUuidValido(idProductoProveedor)) {//Validamos que el UUID que estamos mandando sea adecuado
        callback(new ErrorApp(400, 'El id no es válido'), null);
        return;
    }
    if (!nombre || !descripcion) {
        callback(new ErrorApp(400, 'Faltan datos del producto'), null);
        return;
    }
    if (!validadores.esLongitudValida(nombre, 3, 80)) {
        callback(new ErrorApp(400, 'El nombre debe tener entre 3 y 80 caracteres'), null);
        return;
    }
    if (!validadores.esLongitudValida(descripcion, 1, 300)) {
        callback(new ErrorApp(400, 'La descripción es obligatoria y tiene un máximo de 300 caracteres'), null);
        return;
    }
    if (!validadores.esDecimalPositivoValido(precioUnitario)) {
        callback(new ErrorApp(400, 'El precio debe ser un decimal mayor a 0 con máximo 2 decimales'), null);
        return;
    }
    productoProveedorService.editarProductoProveedor(idProductoProveedor, nombre, descripcion, precioUnitario, (error, resultado) => {
        if (error) {
            if (error.code === 'ER_DUP_ENTRY') {//El nombre de un producto es unico, asi que no se puede tener multiples, si se desea usar un mismo producto para un proveedor pues se puede usar la opcion de vincular con un producto ya existente
                callback(new ErrorApp(409, 'Ya existe un producto con ese nombre'), null);
                return;
            }
            callback(new ErrorApp(500, 'Error al editar'), null);
            return;
        }
        if (resultado.affectedRows === 0) {
            callback(new ErrorApp(404, 'No se encontró el producto del proveedor'), null);
            return;
        }
        callback(null, true);
    });
}

// Elimina la asociación producto-proveedor; aquí no hay desactivación, la fila simplemente se borra
function eliminarProductoProveedor(idProveedor, idProducto, callback) {
    //Aquí tenemos que validar los demás parametros usamos los validadores que definí previamente en config/validadores
    if (!validadores.esUuidValido(idProveedor)) {//Validamos que el UUID que estamos mandando sea adecuado
        return new ErrorApp(400, 'El id del proveedor no es válido');
    }
    if (!validadores.esUuidValido(idProducto)) {//Validamos que el UUID que estamos mandando sea adecuado
        callback(new ErrorApp(400, 'El id del producto no es válido'), null);
        return;
    }
    productoProveedorService.eliminarProductoProveedor(idProveedor, idProducto, (error, resultado) => {
        if (error) {
            callback(new ErrorApp(500, 'Error al eliminar la asociación'), null);
            return;
        }
        if (resultado.affectedRows === 0) {
            callback(new ErrorApp(404, 'No existe esa asociación producto-proveedor'), null);
            return;
        }
        callback(null, true);
    });
}
//Exportamos las funciones para que el router las pueda utilizar
module.exports = {
    obtenerProveedores,
    registrarProveedor,
    editarProveedor,
    desactivarProveedor,
    obtenerProductosProveedor,
    asociarProductoProveedor,
    editarProductoProveedor,
    eliminarProductoProveedor,
};