const db = require('../config/db');

const DOMINIO_BACKEND = 'http://localhost:3200';//Para que en dado caso de cambiar el puerto o dir del backend las imagenes nuevas actualicen su ruta

/* Trae los productos activos con stock disponible, para que el front arme el carrito.
El campo "cantidad" de ProductoCarrito no aplica aquí (es 0 hasta que el cliente lo agregue),
así que el front debe inicializarlo al recibir estos datos

Esto es un poco curioso, pero basicamente como yo guardo en localStorage solo el id y cantidad
requiero de esta petición para armar ahi en pedido pues la lista "actualizada", con los valores
de producto y asi, esta lista me devuelve todos los productos registrados y ell front los analiza
*/ 
function obtenerProductosCarrito(callback) {
    const sentencia = `
        SELECT
            id_producto AS idProducto,
            nombre,
            descripcion,
            precio,
            stock_actual AS stockDisponible,
            img_url AS imagenUrl
        FROM Producto
        WHERE activo = TRUE AND stock_actual > 0
    `;
    db.query(sentencia, (error, resultados) => {
        if (error) {
            callback(error, null);
            return;
        }
        // MySQL regresa las columnas DECIMAL como texto (ej. "45.00"), no como número,
        // aquí las convertimos explícitamente con Number() antes de mandarlas al front
        const resultadosConvertidos = resultados.map(producto => ({
            ...producto,
            precio: Number(producto.precio),
            imagenUrl: producto.imagenUrl!=='' ? `${DOMINIO_BACKEND}/${producto.imagenUrl}` : null
        }));
        callback(null, resultadosConvertidos);
    });
}

// Verifica que la cantidad solicitada de cada producto no exceda el stock disponible
// "items" es un arreglo [{ idProducto, cantidad }] que manda el front al momento de pagar
function validarDisponibilidad(items, callback) {
    if (!items || items.length === 0) {
        callback(null, { valido: false, mensaje: 'El carrito está vacío' });
        return;
    }

    const ids = items.map(item => item.idProducto);
    const sentencia = `
        SELECT id_producto AS idProducto, stock_actual AS stockDisponible
        FROM Producto
        WHERE id_producto IN (?)
    `;
    db.query(sentencia, [ids], (error, resultados) => {
        if (error) {
            callback(error, null);
            return;
        }
        const stockPorId = new Map(resultados.map(r => [r.idProducto, r.stockDisponible]));
        const excedidos = items.filter(item => (stockPorId.get(item.idProducto) ?? 0) < item.cantidad);
        callback(null, { valido: excedidos.length === 0, excedidos });
    });
}

module.exports = {
    obtenerProductosCarrito,
    validarDisponibilidad,
};