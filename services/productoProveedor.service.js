const db = require('../config/db');
const { ProductoProveedor }=require('../models/productoProveedor.model')

// Trae los productos asociados a UN proveedor específico
function obtenerProductosProveedor(callback) {
    const sentencia = `
        SELECT
            cp.id_catalogo_proveedor AS idProductoProveedor,
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
        const resultadosConvertidos = resultados.map(producto => new ProductoProveedor({
            ...producto,
            precio: Number(producto.precio),
        }));
        callback(null, resultadosConvertidos);
    });
}

//Devuelve solamente el precio de un producto de un proveedor (esto es justo lo necesario para hacer una compra) no se requiere más
function obtenerPrecioCompra(conexion, idProveedor, idProducto, callback) {
    const sentencia = `
        SELECT precio_compra AS precioCompra
        FROM Catalogo_Proveedor
        WHERE id_proveedor = ? AND id_producto = ?
    `;
    conexion.query(sentencia, [idProveedor, idProducto], (error, resultados) => {
        if (error) {
            callback(error, null);
            return;
        }
        if (resultados.length === 0) {//Si no encontramos ningún producto, entonces esta mal y retornamos
            callback(null, null);
            return;
        }
        //En caso de que si hayamos encontrado algo, pues retornamos el primer indice ya que solo debe de haber 1 resultado
        callback(null, Number(resultados[0].precioCompra));
    });
}
// Asocia un producto existente a un proveedor con su precio de compra,
function asociarProductoProveedor(idProveedor, idProducto, precioCompra, callback) {
    const sentencia = `
        INSERT INTO Catalogo_Proveedor (id_proveedor, id_producto, precio_compra)
        VALUES (?, ?, ?)
    `;
    db.query(sentencia, [idProveedor, idProducto, precioCompra], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
        return;
    });
}

// Asocia un producto existente a un proveedor con su precio de compra,
function asociarProductoProveedorTransaccion(conexion, idProveedor, idProducto, costoNumero, callback) {
    const sentencia = `
        INSERT INTO Catalogo_Proveedor (id_proveedor, id_producto, precio_compra)
        VALUES (?, ?, ?)
    `;
    conexion.query(sentencia, [idProveedor, idProducto, costoNumero], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
        return;
    });
}

// Edita un producto desde el módulo de proveedores. El nombre y la descripción viven en Producto
// (son compartidos), pero el precio es el precio de compra de ESTE proveedor, que vive en Catalogo_Proveedor
function editarProductoProveedor(idProductoProveedor, nombre, descripcion, precioUnitario, callback) {
    const sentencia = `
        UPDATE Catalogo_Proveedor cp
        JOIN Producto p ON p.id_producto = cp.id_producto
        SET p.nombre = ?,
            p.descripcion = ?,
            p.fecha_modificado = NOW(),
            cp.precio_compra = ?,
            cp.fecha_modificado = NOW()
        WHERE cp.id_catalogo_proveedor = ?
    `;
    db.query(sentencia,[nombre, descripcion, precioUnitario, idProductoProveedor],(error, resultado) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, resultado);
        }
    );
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

// Actualiza la fecha de última modificación de las asociaciones de un producto con sus proveedores.
function actualizarFechaModificadoPorProducto(conexion, idProducto, callback) {
    const sentencia = 'UPDATE Catalogo_Proveedor SET fecha_modificado = NOW() WHERE id_producto = ?';
    conexion.query(sentencia, [idProducto], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

function eliminarAsociacionesDeProveedor(conexion, idProveedor, callback) {
    const sentencia = 'DELETE FROM Catalogo_Proveedor WHERE id_proveedor = ?';
    conexion.query(sentencia, [idProveedor], (error, resultado) => {
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
    asociarProductoProveedorTransaccion,
    eliminarProductoProveedor,
    editarProductoProveedor,
    actualizarFechaModificadoPorProducto,
    eliminarAsociacionesDeProveedor,
    obtenerPrecioCompra
};