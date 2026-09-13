//En este archivo se permite obtener el conjunto de datos de la BD considerando los modales como plantilla
const db = require('../config/db');

const DOMINIO_BACKEND = 'http://localhost:3200';//Para que en dado caso de cambiar el puerto o dir del backend las imagenes nuevas actualicen su ruta

// Trae el catalogo completo, los filtros los hace el front
function obtenerProductos(callback) {
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
        if (error) {
            callback(error, null);//El formato de devolución de la función es: Error, Resultado, asi que cuando se reciba se aplica Desestructuración: {error,resultado}
            return;
        }
        // Igual que en carrito y pedidos, MySQL regresa el DECIMAL como texto,
        // aqui lo convertimos a número antes de mandarlo al front
        const resultadosConvertidos = resultados.map(producto => ({
            ...producto,
            precio: Number(producto.precio),
            stock: Number(producto.stock),
            // Si el producto no tiene imagen, no le pegamos el dominio a nada (se queda vacío
            // o null, y el front decide mostrar su placeholder)
            imagenUrl: producto.imagenUrl!=='' ? `${DOMINIO_BACKEND}/${producto.imagenUrl}` : null
        }));
        callback(null, resultadosConvertidos);

    });
}

function obtenerProductoPorId(idProducto,callback){
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
        if(error){
            callback(error,null);
            return;
        }
        // Igual que en carrito y pedidos, MySQL regresa el DECIMAL como texto,
        // aqui lo convertimos a número antes de mandarlo al front
        const resultadosConvertidos = resultados.map(producto => ({
            ...producto,
            precio: Number(producto.precio),
            stock: Number(producto.stock),
            imagenUrl: producto.imagenUrl ? `${DOMINIO_BACKEND}/${producto.imagenUrl}` : null
        }));
        callback(null,resultadosConvertidos[0]||null) //Al hacer este tipo de busquedas
        //puede retornar 0 o 1, así que si no encuentra valores pues devuelve null
    })
}

// Edita nombre, descripcion y precio de un producto existente, los cuales
// son los unicos valores que se pueden modificar en el sitio en la sección de Inventario
function editarProducto(idProducto,datos,callback){
    const sentencia=
    `
    UPDATE Producto
    SET nombre = ?, descripcion = ?, precio = ?, fecha_modificado = NOW()
    WHERE id_producto = ?
    `;
    db.query(sentencia,[datos.nombre, datos.descripcion, datos.precio, idProducto],(error,resultado)=>{
        if(error){
            callback(error,null)
            return;
        }
        callback(null,resultado);//Aquí aunque parezca que no retornamos nada
        //estamos retornado un objeto por defecto que se da al hacer este tipo de consultas
        // el cual posee metadata suficiente para analizar cuantas filas se modificaron o afectaron, etc
    })
}

// Marca el producto como inactivo, sin borrarlo (RQF10, RQNF15, RQNF27)
function desactivarProducto(idProducto, callback) {
    const sql = `
        UPDATE Producto
        SET activo = FALSE, fecha_desactivado = NOW()
        WHERE id_producto = ?
    `;
    db.query(sql, [idProducto], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

function actualizarImagenProducto(idProducto, rutaImagen, callback) {
    const sql = 'UPDATE Producto SET img_url = ? WHERE id_producto = ?';
    db.query(sql, [rutaImagen, idProducto], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, { ...resultado, imagenUrl: `${DOMINIO_BACKEND}/${rutaImagen}` });
    });
}

// Necesaria para poder borrar el archivo viejo antes de guardar el nuevo
function obtenerImagenActual(idProducto, callback) {
    const sentencia = 'SELECT img_url AS imagenUrl FROM Producto WHERE id_producto = ?';
    db.query(sentencia, [idProducto], (error, resultados) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultados[0] ? resultados[0].imagenUrl : null);
    });
}

// Quita la referencia a la imagen sin tocar el resto del producto
function quitarImagenProducto(idProducto, callback) {
    const sentencia = 'UPDATE Producto SET img_url = NULL WHERE id_producto = ?';
    db.query(sentencia, [idProducto], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    editarProducto,
    desactivarProducto,
    actualizarImagenProducto,
    obtenerImagenActual,
    quitarImagenProducto,
};