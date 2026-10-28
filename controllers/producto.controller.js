//El controller valida, aplica las reglas de producto, arma la dirección de las imágenes y junta producto con productoProveedor (Que son digamos los 2 catalogos, uno de admin y otro de cliente)
const crypto = require('crypto');
//Producto service se encarga de la gestion de la entidad de Producto de la base de datos
const productoService = require('../services/producto.service');
//Producto proveedor se encarga de hacer la gestion para asociar un producto con un proveedor o devolver especificos
const productoProveedorService = require('../services/productoProveedor.service');
const transaccionService = require('../services/transaccion.service');
const uploadConfig = require('../config/upload');
const validadores = require('../config/validadores');
const { unirUrlCompleta } = require('../config/imagen');
const { ErrorApp } = require('../models/errorApp.model');
const { RespuestaCompra } = require('../models/respuestaCompra.model');

function obtenerProductos(callback){//Esta función devuelve ya todos los productos pero agregandoles la ruta completa para solicitar desde el Backend
    productoService.obtenerProductos((error,resultado)=>{
        if(error){
            callback(new ErrorApp(500,'Error al consultar productos'),null);
            return;
        }
        resultado.forEach(producto => {
            producto.imagenUrl=unirUrlCompleta(producto.imagenUrl)
        });
        callback(null,resultado)
    })
}
//Esta funcion permite obtener un producto en especifico, y comprueba su id y devuelve la ruta completa a la imagen
function obtenerProductoPorId(idProducto, callback) {
    if (!validadores.esUuidValido(idProducto)) {//Validamos que el UUID sea de formato adecuado
        callback(new ErrorApp(400, 'El id del producto no es válido'), null);
        return;
    }
    productoService.obtenerProductoPorId(idProducto, (error, producto) => {
        if (error) {
            callback(new ErrorApp(500, 'Error al consultar el producto'), null);
            return;
        }
        if (!producto) {//Al buscar por id puede devolver 0 o 1 producto, si no hay, no existe
            callback(new ErrorApp(404, 'Producto no encontrado'), null);
            return;
        }
        producto.imagenUrl = unirUrlCompleta(producto.imagenUrl);
        callback(null, producto);
    });
}

//Esta funcion la reutilizo para evitar estar duplicando codigo a lo menso
function validarDatosProducto(nombre, descripcion, precio) {
    //Aquí tenemos que validar los demás parametros usamos los validadores que definí previamente en config/validadores
    if (!nombre || !descripcion || precio === undefined || precio === null) {//La primera validacion comprueba que si se hayan ingresado los datos
        return new ErrorApp(400, 'Faltan datos del producto');
    }
    if (!validadores.esLongitudValida(nombre, 3, 80)) {//La segunda comprueba que sea el nombre adecuado, entre 3 a 80 caracteres
        return new ErrorApp(400, 'El nombre del producto debe tener entre 3 y 80 caracteres');
    }
    if (!validadores.esLongitudValida(descripcion, 1, 300)) {//Este comprueba que la descripcion no supere los 300 caracts
        return new ErrorApp(400, 'La descripción es obligatoria y tiene un máximo de 300 caracteres');
    }
    if (!validadores.esDecimalPositivoValido(precio)) {//Este comprueba que sea positivo valido el precio y no negativo, además que sea de solo 2 decimales
        return new ErrorApp(400, 'El precio debe ser un decimal mayor a 0 con máximo 2 decimales');
    }
    return null;
}

// El precio de venta inicial nace igual al costoUnitario, es solo un punto de partida editable después
function registrarProducto(nombre, descripcion, costoUnitario, callback) {
    const errorValidacion = validarDatosProducto(nombre, descripcion, costoUnitario);
    if (errorValidacion) {//Si llega a haber un error al vaidar lo tomamos y lo devolvemos
        callback(errorValidacion, null);//Aqui se devuelve el error (este proceso se replica en las funciones siguientes tmb)
        return;
    }
    const idProducto = crypto.randomUUID();//El id se genera, este es único y es generado por el controller (antes lo tenia en el service, pero creo que esto va puramente en controller, ya que todo procesameinto o validacion no es de un service)
    productoService.registrarProductoNuevo(idProducto, nombre, descripcion, costoUnitario, (error) => {
        if (error) {
            if (error.code === 'ER_DUP_ENTRY') {//El nombre es UNIQUE: ya existe un producto con ese nombre
        
                callback(new ErrorApp(409, 'Ya existe un producto con ese nombre'), null);
                return;
            }
    
            callback(new ErrorApp(500, 'Error al crear el producto'), null);
            return;
        }
        callback(null, new RespuestaCompra(true, idProducto));
    });
}

//Permite editar un producto, alterando la fecha de edicion del mismo, y de las tablas asociadas a la misma (proveedores)
function editarProducto(idProducto, nombre, descripcion, precio, callback) {
    if (!validadores.esUuidValido(idProducto)) {//Validamos que el UUID sea de formato adecuado
        callback(new ErrorApp(400, 'El id del producto no es válido'), null);
        return;
    }
    const errorValidacion = validarDatosProducto(nombre, descripcion, precio);
    if (errorValidacion) {
        callback(errorValidacion, null);
        return;
    }
    //Solicitamos una transaccion al servicio de transaccion, para que nos devuelva una misma para hacer un "todo en uno"
    transaccionService.iniciarTransaccion((error, conexion) => {
        if (error) {
            callback(new ErrorApp(500, 'Error al editar el producto'), null);
            return;
        }//Actualizamos el producto, aqui mandamos los datos que ya verificamos previamente
        productoService.actualizarProducto(conexion, idProducto, nombre, descripcion, precio, (error, resultado) => {
            if (error) {
                transaccionService.cancelarTransaccion(conexion);
                if (error.code === 'ER_DUP_ENTRY') {//Si existe una duplicación por algun error, lo notificamos y regresamos
                    callback(new ErrorApp(409, 'Ya existe un producto con ese nombre'), null);
                    return;
                }
                callback(new ErrorApp(500, 'Error al editar el producto'), null);
                return;
            }
            if (resultado.affectedRows === 0) {//Si el producto jamas se encontro, retornamos un error
                transaccionService.cancelarTransaccion(conexion);
                callback(new ErrorApp(404, 'Producto no encontrado'), null);
                return;
            }
            //Si todo lo anterior funciono, proseguimos a modificar la fecha de modificacion de un producto en proveedor, para que se guarde la constancia
            productoProveedorService.actualizarFechaModificadoPorProducto(conexion, idProducto, (error) => {
                if (error) {
                    transaccionService.cancelarTransaccion(conexion);
                    callback(new ErrorApp(500, 'Error al editar el producto'), null);
                    return;
                }
                //Si todo lo anterior sale bien, sin error, ya podemos confirmar la transaccion y continuar, en caso de que no, retornamos error
                transaccionService.confirmarTransaccion(conexion, (error) => {
                    if (error) {
                        callback(new ErrorApp(500, 'Error al editar el producto'), null);
                        return;
                    }
                    callback(null, true);//Como estamos editando, no estamos insertando nada asi que solo retornamos que si fue correcto
                });
            });
        });
    });
}

function desactivarProducto(idProducto,callback){
    if (!validadores.esUuidValido(idProducto)) {//Validamos que el UUID sea de formato adecuado
        callback(new ErrorApp(400, 'El id del producto no es válido'), null);
        return;
    }
    productoService.desactivarProducto(idProducto,(error,resultado)=>{//Manda al service el id del producto a eliminar y espera su respuesta
        if(error){ callback(new ErrorApp(500,'Error al desactivar el producto'),null); return; }
        if(resultado.affectedRows===0){ callback(new ErrorApp(404,'Producto no encontrado'),null); return; }
        callback(null,true);
        //Cuando ya se recibe si no hubo ningun error la enviamos como resultado a la ruta que la use, con el true para decir que fue todo correcto
    })
}

// Esta función reemplaza la imagen del producto,  valida el archivo, borra la anterior, guarda la nueva y regresa su dirección completa
function subirImagen(idProducto, imagenBase64, callback) {
    if (!validadores.esUuidValido(idProducto)) {//Validamos que el UUID sea de formato adecuado
        callback(new ErrorApp(400, 'El id del producto no es válido'), null);
        return;
    }
    if (typeof imagenBase64 !== 'string') {
        callback(new ErrorApp(400, 'La imagen no tiene el formato esperado.'), null);
        return;
    }
    let datosImagen;
    try {
        datosImagen = uploadConfig.decodificarImagen(imagenBase64);
    } catch (error) {//Si no es una imagen válida o no cumple el tamaño o el formato, se avisa con el mensaje de upload.js
        callback(new ErrorApp(400, error.message), null);
        return;
    }

    productoService.obtenerProductoPorId(idProducto, (error, producto) => {
        if (error) {
            callback(new ErrorApp(500, 'Error al consultar el producto'), null);
            return;
        }
        if (!producto) {
            callback(new ErrorApp(404, 'Producto no encontrado'), null);
            return;
        }
        let rutaImagen;
        try {//Guardar y borrar archivos puede fallar por eso va en un try
            uploadConfig.eliminarImagenArchivo(producto.imagenUrl);
            rutaImagen = uploadConfig.guardarImagen(idProducto, datosImagen.buffer, datosImagen.extension);
        } catch (errorArchivo) {
            console.error(errorArchivo);
            callback(new ErrorApp(500, 'Error al guardar la imagen'), null);
            return;
        }
        productoService.actualizarImagenProducto(idProducto, rutaImagen, (error) => {
            if (error) {
                callback(new ErrorApp(500, 'Error al guardar la imagen'), null);
                return;
            }
            callback(null, unirUrlCompleta(rutaImagen));
        });
    });
}

// Elimina la imagen del producto: borra el archivo y quita la referencia en la BD
function quitarImagen(idProducto, callback) {
    if (!validadores.esUuidValido(idProducto)) {//Validamos que el UUID sea de formato adecuado
        callback(new ErrorApp(400, 'El id del producto no es válido'), null);
        return;
    }
    productoService.obtenerProductoPorId(idProducto, (error, producto) => {
        if (error) {
            callback(new ErrorApp(500, 'Error al consultar el producto'), null);
            return;
        }
        if (!producto) {
            callback(new ErrorApp(404, 'Producto no encontrado'), null);
            return;
        }
        try {
            uploadConfig.eliminarImagenArchivo(producto.imagenUrl);
        } catch (errorArchivo) {
            console.error(errorArchivo);
            callback(new ErrorApp(500, 'Error al eliminar la imagen'), null);
            return;
        }
        productoService.quitarImagenProducto(idProducto, (error) => {
            if (error) {
                callback(new ErrorApp(500, 'Error al eliminar la imagen'), null);
                return;
            }
            callback(null, true);
        });
    });
}
//Exportamos las funciones para que el router las pueda utilizar
module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    registrarProducto,
    editarProducto,
    desactivarProducto,
    subirImagen,
    quitarImagen,
};