const db = require('../config/db');
const {DatoFinanciero}=require('../models/datoFinanciero.model')

// Las tres consultas regresan el monto ya sumado POR DÍA, con la fecha como texto yyyy-MM-dd
// (DATE_FORMAT evita que Node convierta la fecha a Date y se corra por la zona horaria)
// Usamos DATE(fecha) en el WHERE porque BETWEEN con un DATETIME dejaría fuera las ventas
// del último día (se compararía contra las 00:00:00 de ese día)

// Ventas no canceladas
function obtenerVentasPorDia(fechaInicio, fechaFin, callback) {
    const sentencia = `
        SELECT DATE_FORMAT(fecha, '%Y-%m-%d %H:%i:%s') AS dia, SUM(total_pagado) AS monto
        FROM Venta
        WHERE cancelado = FALSE AND DATE(fecha) BETWEEN ? AND ?
        GROUP BY dia
        ORDER BY dia
    `;
    db.query(sentencia, [fechaInicio, fechaFin], (error, filas) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, filas.map(fila => new DatoFinanciero(fila.dia, Number(fila.monto))));
    });
}

// Compras a proveedores
function obtenerComprasPorDia(fechaInicio, fechaFin, callback) {
    const sentencia = `
        SELECT DATE_FORMAT(fecha, '%Y-%m-%d %H:%i:%s') AS dia, SUM(total) AS monto
        FROM Compra
        WHERE DATE(fecha) BETWEEN ? AND ?
        GROUP BY dia
        ORDER BY dia
    `;
    db.query(sentencia, [fechaInicio, fechaFin], (error, filas) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, filas.map(fila => new DatoFinanciero(fila.dia, Number(fila.monto))));
    });
}

// Cada asistencia = un día pagado, al salario diario del trabajador.
// Asistencia guarda fecha y hora de entrada por separado, así que TIMESTAMP(fecha, hora_entrada)
function obtenerNominaPorDia(fechaInicio, fechaFin, callback) {
    const sentencia = `
        SELECT DATE_FORMAT(TIMESTAMP(a.fecha, a.hora_entrada), '%Y-%m-%d %H:%i:%s') AS dia, SUM(t.salario) AS monto
        FROM Asistencia a
        INNER JOIN Trabajador t ON t.id_trabajador = a.id_trabajador
        WHERE a.fecha BETWEEN ? AND ?
        GROUP BY dia
        ORDER BY dia
    `;
    db.query(sentencia, [fechaInicio, fechaFin], (error, filas) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, filas.map(fila => new DatoFinanciero(fila.dia, Number(fila.monto))));
    });
}

module.exports = {
    obtenerVentasPorDia,
    obtenerComprasPorDia,
    obtenerNominaPorDia,
};