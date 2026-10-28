//En este archivo se permite obtener el conjunto de datos de la BD considerando los modales como plantilla
const db = require('../config/db');
const { ProductoDeVenta } = require('../models/productoDeVenta.model');
const { Producto } = require('../models/producto.model');

// Trae el catalogo completo, los filtros los hace el front
function obtenerProductos(callback) {
    //Declaramos la sentencia que se manda a la base de datos
    const sentencia = 
    `SELECT
        id_producto AS idProducto,
        nombre,
        descripcion,
        precio,
        stock_actual AS stock,
        img_url AS imagenUrl,
        activo
    FROM Producto
    WHERE activo = TRUE`;//Usamos esta sentencia para que los valores se regresen usando el formato esperado por los Models, para que sean procesados de la manera requerida
    //BD con MySQL usa el sistema de guion, snake_case, pero aqui yo uso camelCase
    
    db.query(sentencia, (error, resultados) => {
        if (error) {//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error, null);
            return;
        }
        // Igual que en carrito y pedidos, MySQL regresa el DECIMAL como texto,
        // aqui lo convertimos a número antes de mandarlo al front
        const resultadosConvertidos = resultados.map(producto => new Producto(//Creamos un producto
            producto.idProducto, producto.nombre, producto.descripcion, Number(producto.precio),
            Number(producto.stock), producto.imagenUrl, !!producto.activo
        ));
        callback(null, resultadosConvertidos);
    });
}

function obtenerProductoPorId(idProducto,callback){
    //Declaramos la sentencia que se manda a la base de datos
    const sentencia=
    `
    SELECT
        id_producto AS idProducto,
        nombre,
        descripcion,
        precio,
        stock_actual AS stock,
        img_url AS imagenUrl,
        activo
    FROM Producto
    WHERE id_producto = ?
    `;
    db.query(sentencia,[idProducto],(error,resultados)=>{
        if(error){//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error,null);
            return;
        }
        const fila = resultados[0];//Como es una consulta directa obtenemos el primer producto
        if (!fila) {//Si no existe, entonces nunca se encontro
            callback(null, null);
            return;
        }
        callback(null, new Producto(//Creamos un producto
            fila.idProducto, fila.nombre, fila.descripcion, Number(fila.precio),
            Number(fila.stock), fila.imagenUrl, !!fila.activo
        ));
    })
}

function registrarProductoNuevo(idProducto, nombre, descripcion, precio, callback) {
    //Declaramos la sentencia que se manda a la base de datos
    const sentencia = `
        INSERT INTO Producto (id_producto, nombre, descripcion, precio, stock_actual)
        VALUES (?, ?, ?, ?, 0)
    `;
    // El precio de venta inicial nace igual al costoUnitario que se está pagando
    // al proveedor, esto es solo un punto de partida editable después
    db.query(sentencia, [idProducto, nombre, descripcion, precio], (error, resultado) => {
        if (error) {//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

function registrarProductoNuevoTransaccion(conexion,idProducto, nombre, descripcion, precio, callback) {
    //Declaramos la sentencia que se manda a la base de datos
    const sentencia = `
        INSERT INTO Producto (id_producto, nombre, descripcion, precio, stock_actual)
        VALUES (?, ?, ?, ?, 0)
    `;
    // El precio de venta inicial nace igual al costoUnitario que se está pagando
    // al proveedor, esto es solo un punto de partida editable después
    conexion.query(sentencia, [idProducto, nombre, descripcion, precio], (error, resultado) => {
        if (error) {//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}



// Trae los productos de UNA venta, con la cantidad y el precio al que se vendieron (no el precio actual del producto)
// El subtotal lo calcula MySQL (cantidad por precio), así no hay errores de decimales de JavaScript
function obtenerProductosDeVenta(idVenta, callback) {
    //Declaramos la sentencia que se manda a la base de datos
    const sentencia = `
        SELECT
            p.nombre AS nombre,
            dv.cantidad AS cantidad,
            dv.precio_unitario AS precioUnitario,
            dv.cantidad * dv.precio_unitario AS subtotal
        FROM Detalle_Venta dv
        JOIN Producto p ON p.id_producto = dv.id_producto
        WHERE dv.id_venta = ?
    `;
    db.query(sentencia, [idVenta], (error, filas) => {
        if (error) {//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error, null);
            return;
        }
        callback(null, filas.map(fila => new ProductoDeVenta(
            fila.nombre, Number(fila.cantidad), Number(fila.precioUnitario), Number(fila.subtotal)
        )));
    });
}

// Edita nombre, descripción y precio, y actualiza la fecha de última modificación 
// Recibe la conexión porque se ejecuta dentro de la transacción que arma el controller
function actualizarProducto(conexion, idProducto, nombre, descripcion, precio, callback) {
    //Declaramos la sentencia que se manda a la base de datos
    const sentencia = `
        UPDATE Producto
        SET nombre = ?, descripcion = ?, precio = ?, fecha_modificado = NOW()
        WHERE id_producto = ?
    `;
    conexion.query(sentencia, [nombre, descripcion, precio, idProducto], (error, resultado) => {
        if (error) {//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

// Marca el producto como inactivo, sin borrarlo
function desactivarProducto(idProducto, callback) {
    //Declaramos la sentencia que se manda a la base de datos
    const sql = `
        UPDATE Producto
        SET activo = FALSE, fecha_desactivado = NOW()
        WHERE id_producto = ?
    `;
    db.query(sql, [idProducto], (error, resultado) => {
        if (error) {//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

function actualizarImagenProducto(idProducto, rutaImagen, callback) {
    //Declaramos la sentencia que se manda a la base de datos
    const sql = 'UPDATE Producto SET img_url = ? WHERE id_producto = ?';
    db.query(sql, [rutaImagen, idProducto], (error, resultado) => {
        if (error) {//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

// Quita la referencia a la imagen sin tocar el resto del producto
function quitarImagenProducto(idProducto, callback) {
    //Declaramos la sentencia que se manda a la base de datos
    const sentencia = 'UPDATE Producto SET img_url = NULL WHERE id_producto = ?';
    db.query(sentencia, [idProducto], (error, resultado) => {
        if (error) {//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

function aumentarStock(conexion, idProducto, cantidadNumero,callback){
    //Declaramos la sentencia que se manda a la base de datos
    const sentencia = `
        UPDATE Producto SET stock_actual = stock_actual + ? WHERE id_producto = ?
    `;
    conexion.query(sentencia, [cantidadNumero, idProducto], (error,resultado) => {
        if (error) {//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error, null);
            return;
        }
        callback(null,resultado)
    })
}
//Exportamos todas las funciones para que sean utilizadas por los controllers
module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    obtenerProductosDeVenta,
    registrarProductoNuevo,
    actualizarProducto,
    desactivarProducto,
    actualizarImagenProducto,
    quitarImagenProducto,
    registrarProductoNuevoTransaccion,
    aumentarStock
};