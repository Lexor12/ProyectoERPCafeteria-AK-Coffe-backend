const crypto = require('crypto');//Usamos esto, ya que como yo decidi usar UUID, no hay forma de obtener el último valor incertado en una tabla, ya que no es como con manejar ID
const db = require('../config/db');

// Registra una compra de un producto que YA EXISTE en el catálogo y ya está asociado
// al proveedor (esto es el botón "Surtir"), aumenta el stock de ese producto (RQF22, RQF23)
function registrarCompraProductoExistente(idProveedor, idProducto, cantidad, costoUnitario, callback) {
    if (!cantidad || cantidad <= 0) {
        callback(null, { registrada: false, mensaje: 'La cantidad debe ser mayor a 0' });
        return;
    }

    db.getConnection((error, conexion) => {
        if (error) {
            callback(error, null);
            return;
        }

        conexion.beginTransaction((error) => {
            if (error) {
                conexion.release();
                callback(error, null);
                return;
            }

            // Generamos el id de la compra nosotros mismos, así no dependemos de "adivinar"
            // cuál fue la última compra insertada, como sí tuvimos que hacer con las ventas
            const idCompra = crypto.randomUUID();
            const total = cantidad * costoUnitario;

            const sentenciaCompra = `
                INSERT INTO Compra (id_compra, id_proveedor, fecha, total)
                VALUES (?, ?, NOW(), ?)
            `;
            conexion.query(sentenciaCompra, [idCompra, idProveedor, total], (error) => {
                if (error) {
                    conexion.rollback(() => conexion.release());
                    callback(error, null);
                    return;
                }

                const sentenciaDetalle = `
                    INSERT INTO Detalle_Compra (id_compra, id_producto, cantidad, costo_unitario)
                    VALUES (?, ?, ?, ?)
                `;
                conexion.query(sentenciaDetalle, [idCompra, idProducto, cantidad, costoUnitario], (error) => {
                    if (error) {
                        conexion.rollback(() => conexion.release());
                        callback(error, null);
                        return;
                    }

                    const sentenciaStock = 'UPDATE Producto SET stock_actual = stock_actual + ? WHERE id_producto = ?';
                    conexion.query(sentenciaStock, [cantidad, idProducto], (error) => {
                        if (error) {
                            conexion.rollback(() => conexion.release());
                            callback(error, null);
                            return;
                        }

                        conexion.commit((error) => {
                            conexion.release();
                            if (error) {
                                callback(error, null);
                                return;
                            }
                            callback(null, { registrada: true, idCompra, total });
                        });
                    });
                });
            });
        });
    });
}

/* 
Permite registrar un producto, primero lo crea con stock en 0, y usa el mismo precio que se le compra al proveedor como precio de venta
(después el admin lo puede ajustar libremente desde Inventario, sin que eso
afecte el precio_compra guardado aquí en Catalogo_Proveedor).

También lo asocia al proveedor con ese mismo precio como precio de compra.
Aquí NO se registra ninguna compra ni se le da stock, eso se hace después con un
"Surtir" normal una vez que el producto ya existe y está asociado
*/
function registrarCompraProductoNuevo(idProveedor, datosProducto, costoUnitario, callback) {
    db.getConnection((error, conexion) => {
        if (error) {
            callback(error, null);
            return;
        }

        conexion.beginTransaction((error) => {
            if (error) {
                conexion.release();
                callback(error, null);
                return;
            }

            const idProducto = crypto.randomUUID();

            // El precio de venta inicial nace igual al costoUnitario que se está pagando
            // al proveedor, esto es solo un punto de partida editable después
            const sentenciaProducto = `
                INSERT INTO Producto (id_producto, nombre, descripcion, precio, stock_actual)
                VALUES (?, ?, ?, ?, 0)
            `;
            conexion.query(sentenciaProducto, [idProducto, datosProducto.nombre, datosProducto.descripcion, costoUnitario], (error) => {
                if (error) {
                    conexion.rollback(() => conexion.release());
                    callback(error, null);
                    return;
                }

                const sentenciaCatalogo = `
                    INSERT INTO Catalogo_Proveedor (id_proveedor, id_producto, precio_compra)
                    VALUES (?, ?, ?)
                `;
                conexion.query(sentenciaCatalogo, [idProveedor, idProducto, costoUnitario], (error) => {
                    if (error) {
                        conexion.rollback(() => conexion.release());
                        callback(error, null);
                        return;
                    }

                    conexion.commit((error) => {
                        conexion.release();
                        if (error) {
                            callback(error, null);
                            return;
                        }
                        callback(null, { registrada: true, idProducto });
                    });
                });
            });
        });
    });
}

module.exports = {
    registrarCompraProductoExistente,
    registrarCompraProductoNuevo,
};