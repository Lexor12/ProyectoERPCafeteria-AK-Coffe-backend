const db = require('../config/db');

const DOMINIO_BACKEND = 'http://localhost:3200';//Para que en dado caso de cambiar el puerto o dir del backend las imagenes nuevas actualicen su ruta

// Trae los productos asociados a UN proveedor específico
function obtenerProductosProveedor(callback) {
    const sentencia = `
        SELECT
            p.id_producto AS idProducto,
            p.nombre,
            p.descripcion,
            cp.precio_compra AS precio,
            cp.id_proveedor AS idProveedor,
            p.img_url AS imagenUrl
        FROM Catalogo_Proveedor cp
        JOIN Producto p ON p.id_producto = cp.id_producto
        WHERE p.activo = TRUE;
    `;
    
    db.query(sentencia, (error, resultados) => {
        if (error) {
            callback(error, null);
            return;
        }
        // Igual que en carrito y pedidos, MySQL regresa el DECIMAL como texto,
        // aqui lo convertimos a número antes de mandarlo al front
        const resultadosConvertidos = resultados.map(producto => ({
            ...producto,
            precio: Number(producto.precio),
            imagenUrl: producto.imagenUrl ? `${DOMINIO_BACKEND}/${producto.imagenUrl}` : null
        }));
        callback(null, resultadosConvertidos);
    });
}

// Asocia un producto existente a un proveedor con su precio de compra,
// Cuando creamos un producto de un proveedor, primero creamos el producto, despues
// llamamos a esta función y enlazamos el producto creado
// o también si solo asignamos un producto existente a un provedor, pues tambíen se puede
function asociarProductoProveedor(idProveedor, idProducto, precioCompra, callback) {
    const sentencia = `
        INSERT INTO Catalogo_Proveedor (id_proveedor, id_producto, precio_compra)
        VALUES (?, ?, ?)
    `;
    db.query(sentencia, [idProveedor, idProducto, precioCompra], (error, resultado) => {
        if (error) {
            if (error.code === 'ER_DUP_ENTRY') {//En caso de que intente reasignar el mismo producto a un proveedor, se cancela
                //primero debera de eliminarlo y despúes volverlo a agregar al producto ya con su precio nuevo
                callback({ duplicado: true }, null);
            }
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

// Elimina la asociación entre un producto y un proveedor (solo la fila de Catalogo_Proveedor,
// el producto en sí NUNCA se borra, solo se desactiva desde el módulo de Inventario)
function eliminarProductoProveedor(idProveedor, idProducto, callback) {
    const sentencia = `
        DELETE FROM Catalogo_Proveedor
        WHERE id_proveedor = ? AND id_producto = ?
    `;
    db.query(sentencia, [idProveedor, idProducto], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

module.exports = {
    obtenerProductosProveedor,
    asociarProductoProveedor,
    eliminarProductoProveedor,
};