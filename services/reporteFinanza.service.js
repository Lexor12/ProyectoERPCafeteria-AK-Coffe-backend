const db = require('../config/db');

// Genera el reporte financiero de un rango de fechas
function obtenerReporteFinanza(fechaInicio, fechaFin, callback) {
    const sentenciaVentas = `
        SELECT fecha, total_pagado AS monto
        FROM Venta
        WHERE cancelado = FALSE AND DATE(fecha) BETWEEN ? AND ?
        ORDER BY fecha
    `;//Tenemos que poner DATE, ya que:
    /*
    BETWEEN solo acepta registros con fecha igual o antes de las 00:00:00 del dia 12, asi que usando funcion de DATE 
    le quitamos la hora al campo antes de compararlo, lo que permite comparar sin definir la hora
    */
    const sentenciaCompras = `
        SELECT fecha, total AS monto
        FROM Compra
        WHERE DATE(fecha) BETWEEN ? AND ?
        ORDER BY fecha
    `;
    db.query(sentenciaVentas, [fechaInicio, fechaFin], (errorVentas, ventas) => {
        if (errorVentas) {
            callback(errorVentas, null);
            return;
        }

        db.query(sentenciaCompras, [fechaInicio, fechaFin], (errorCompras, compras) => {
            if (errorCompras) {
                callback(errorCompras, null);
                return;
            }

            let ingresos = 0;
            for (const v of ventas) {
                ingresos += Number(v.monto);//Obtenemos el total en ventas
            }

            let egresos = 0;
            for (const c of compras) {
                egresos += Number(c.monto);//Obtenemos el total en compras a proveedores
            }

            callback(null, {
                fechaInicio,
                fechaFin,
                ingresos,
                egresos,
                balance: ingresos - egresos,
                detalleVentas: ventas,   // [{ fecha, monto }], asi como se pide en ProductoDeVenta, lamentablemente aqui no tenemos tipado explicito así que ojala y nunca cambie esto de nombre en Models
                detalleCompras: compras, // [{ fecha, monto }]
            });
        });
    });
}

module.exports = {
    obtenerReporteFinanza,
};