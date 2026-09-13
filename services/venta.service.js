const db = require('../config/db');

/*Registra una venta completa y valida el stock actual de cada producto del mismo,después calcula el total
tomando el precio real de la BD (nunca confiamos en el precio que venga del front,
inserta la venta, inserta el detalle de cada producto, y reduce el stock. Todo esto debe
pasar completo o no pasar nada, por eso usamos una transacción para en caso de que no funcione
pues simplemente se cancele, es literal las transacciones que vi con ACID con Kegovc pero en .js
*/
function registrarVenta(idUsuario, rfcCliente, items, callback) {
    if (!items || items.length === 0) {
        callback(null, { registrada: false, mensaje: 'El carrito está vacío' });
        return;
    }

    /* 
    Aqui tenemos que pedir una conexión "dedicada" del pool. Esto es necesario porque una transacción
    tiene que correr TODAS sus consultas sobre la misma conexión, si usáramos db.query
    normal cada consulta podría ir a una conexión distinta del pool y la transacción no jalaría
    */
    db.getConnection((error, conexion) => {
        if (error) {//Si hay error simplemente regresamos y ya, no vale la pena continuar
            callback(error, null);
            return;
        }

        // A partir de aquí empieza la transacción: nada se guarda "de verdad" todavía
        conexion.beginTransaction((error) => {
            if (error) {
                conexion.release(); // Regresamos la conexión al pool aunque haya fallado
                callback(error, null);
                return;
            }

            verificarStockYPrecios(conexion, items, (error, resultado) => {
                if (error) {
                    conexion.rollback(() => conexion.release());
                    callback(error, null);
                    return;
                }

                // Si aunque sea minimo 1 solo producto que ya no tiene suficiente stock,
                // lo mejor es cancelar la transacción y notificar al cliente
                if (resultado.excedidos.length > 0) {
                    conexion.rollback(() => conexion.release());
                    callback(null, { registrada: false, mensaje: 'Stock insuficiente', excedidos: resultado.excedidos });
                    return;
                }

                insertarVentaCompleta(conexion, idUsuario, rfcCliente, resultado.itemsConPrecio, resultado.total, (error, idVenta) => {
                    if (error) {
                        conexion.rollback(() => conexion.release());
                        callback(error, null);
                        return;
                    }

                    // Si TODO salió bien, aquí sí confirmamos de verdad los cambios en la BD
                    conexion.commit((error) => {
                        conexion.release(); // Ya terminamos, regresamos la conexión al pool para que otros la usen
                        if (error) {
                            callback(error, null);
                            return;
                        }
                        callback(null, { registrada: true, idVenta, total: resultado.total });
                    });
                });
            });
        });
    });
}

// Revisa uno por uno los productos del carrito y trae su precio y stock actuales desde la BD
// (no del front), y va acumulando el total real de la venta y cuáles productos no alcanzan
function verificarStockYPrecios(conexion, items, callback) {
    const itemsConPrecio = [];
    const excedidos = [];
    let total = 0;
    let indice = 0; // Aquí llevamos la cuenta de en qué producto del arreglo vamos

    // Como cada consulta a la BD es asíncrona (tarda un poquito y no sabemos cuándo termina),
    // no podemos usar un "for" normal, porque el for no espera. En su lugar, hacemos una función
    // que se llama a sí misma: revisa un producto, y cuando termina, llama de nuevo para el siguiente
    function revisarSiguienteProducto() {
        if (indice >= items.length) {
            // Ya revisamos todos los productos del carrito
            callback(null, { itemsConPrecio, excedidos, total });
            return;
        }

        const itemActual = items[indice];

        // "FOR UPDATE" le dice a MySQL: bloquea esta fila mientras dure mi transacción,
        // para que nadie más pueda comprar este mismo producto al mismo tiempo que yo
        // y terminemos vendiendo más de lo que hay en stock
        const sentencia = 'SELECT precio, stock_actual AS stock FROM Producto WHERE id_producto = ? FOR UPDATE';

        conexion.query(sentencia, [itemActual.idProducto], (error, resultados) => {
            if (error) {
                callback(error, null);
                return;
            }

            const producto = resultados[0];
            const precioReal = Number(producto.precio);

            if (!producto || producto.stock < itemActual.cantidad) {
                excedidos.push(itemActual);
            } else {
                itemsConPrecio.push({
                    idProducto: itemActual.idProducto,
                    cantidad: itemActual.cantidad,
                    precioUnitario: precioReal,
                });
                total += precioReal * itemActual.cantidad;
            }

            indice = indice + 1;
            revisarSiguienteProducto(); // Pasamos al siguiente producto del carrito
        });
    }
    revisarSiguienteProducto(); // Ejecutamos 1 sola vez la función, y ya como la función es recursiva, esta se ejecutará varias veces
}

// Inserta la venta, su detalle (uno por producto), y reduce el stock de cada producto vendido
function insertarVentaCompleta(conexion, idUsuario, rfcCliente, itemsConPrecio, total, callback) {
    const sentenciaVenta = `
        INSERT INTO Venta (id_usuario, total_pagado, RFC, entregado, cancelado)
        VALUES (?, ?, ?, FALSE, FALSE)
    `;
    conexion.query(sentenciaVenta, [idUsuario, total, rfcCliente || null], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }

        // Como id_venta lo genera la BD sola con UUID() por default, no viene en el parametro de "resultado.insertId"
        // (lo cual solo pasa con auto-incrementales), así que lo tenemos que volver a consultar,la unica forma
        // y la más precisa es considerando cual fue la ultima venta realizada por el usuario 
        conexion.query('SELECT id_venta FROM Venta WHERE id_usuario = ? ORDER BY fecha DESC LIMIT 1', [idUsuario], (error, filas) => {
            if (error) {
                callback(error, null);
                return;
            }
            const idVenta = filas[0].id_venta;
            insertarDetalleYReducirStock(conexion, idVenta, itemsConPrecio, 0, callback);
        });
    });
}

// Igual que verificarStockYPrecios, aquí también vamos uno por uno insertando el detalle
// de cada producto y reduciendo su stock, hasta terminar el arreglo completo
function insertarDetalleYReducirStock(conexion, idVenta, itemsConPrecio, indice, callback) {
    if (indice >= itemsConPrecio.length) {
        callback(null, idVenta); // Ya terminamos con todos los productos
        return;
    }

    const item = itemsConPrecio[indice];

    const sentenciaDetalle = `
        INSERT INTO Detalle_Venta (id_venta, id_producto, cantidad, precio_unitario)
        VALUES (?, ?, ?, ?)
    `;
    conexion.query(sentenciaDetalle, [idVenta, item.idProducto, item.cantidad, item.precioUnitario], (error) => {
        if (error) {
            callback(error, null);
            return;
        }

        const sentenciaStock = 'UPDATE Producto SET stock_actual = stock_actual - ? WHERE id_producto = ?';
        conexion.query(sentenciaStock, [item.cantidad, item.idProducto], (error) => {
            if (error) {
                callback(error, null);
                return;
            }
            // Pasamos al siguiente producto del carrito
            insertarDetalleYReducirStock(conexion, idVenta, itemsConPrecio, indice + 1, callback);
        });
    });
}

module.exports = {
    registrarVenta,
};