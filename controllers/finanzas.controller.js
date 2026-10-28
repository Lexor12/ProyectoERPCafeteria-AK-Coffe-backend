//El controller valida, suma los montos y arma el reporte
const reporteFinanzaService = require('../services/reporteFinanza.service');
const validadores = require('../config/validadores');
const { ErrorApp } = require('../models/errorApp.model');
const { ReporteFinanza } = require('../models/reporteFinanza.model');

// Suma los montos de una lista de DatoFinanciero (redondeado a 2 decimales para evitar valores incorrectos)
function sumarMontos(datos) {
    let total = 0;
    for (const dato of datos) {
        total += dato.monto;
    }
    return Math.round(total * 100) / 100;
}

function obtenerReporteFinanza(fechaInicio, fechaFin, callback) {
    //Primero comprobamos que los parametros requeridos realmente tengan datos, si uno falta damos error
    if (!fechaInicio || !fechaFin) {
        callback(new ErrorApp(400, 'Se requiere fechaInicio y fechaFin'), null);
        return;
    }
    //Ahora, para validar los demás parametros usamos los validadores que definí previamente en config/validadores
    if (!validadores.esFechaValida(fechaInicio) || !validadores.esFechaValida(fechaFin)) {
        callback(new ErrorApp(400, 'Las fechas no tienen un formato válido'), null);
        return;
    }
    if (new Date(fechaInicio) > new Date(fechaFin)) {
        callback(new ErrorApp(400, 'fechaInicio no puede ser posterior a fechaFin'), null);
        return;
    }
    //Ahora hacemos una peticion al servicio de reporte de finanza para obtener las ventas por dia, las compras por dia y las nominas pagadas por día
    reporteFinanzaService.obtenerVentasPorDia(fechaInicio, fechaFin, (error, detalleVentas) => {
        if (error) {//En caso de que nos de error el servicio, mandamos directamente a error a pesar de que los demas pueden o hayan funcionado, ya que al fin y al cabo usamos todos estos valores en conjunto
            callback(new ErrorApp(500, 'Error al generar el reporte'), null);
            return;
        }
        reporteFinanzaService.obtenerComprasPorDia(fechaInicio, fechaFin, (error, detalleCompras) => {
            if (error) {//En caso de que nos de error el servicio, mandamos directamente a error a pesar de que los demas pueden o hayan funcionado, ya que al fin y al cabo usamos todos estos valores en conjunto
                callback(new ErrorApp(500, 'Error al generar el reporte'), null);
                return;
            }
            reporteFinanzaService.obtenerNominaPorDia(fechaInicio, fechaFin, (error, detalleNomina) => {
                if (error) {//En caso de que nos de error el servicio, mandamos directamente a error a pesar de que los demas pueden o hayan funcionado, ya que al fin y al cabo usamos todos estos valores en conjunto
                    callback(new ErrorApp(500, 'Error al generar el reporte'), null);
                    return;
                }
                //Calculamos todos los valores ya finales, como los ingresos totales y los egresos, además de la lista total
                const ingresos = sumarMontos(detalleVentas);
                const egresos = Math.round((sumarMontos(detalleCompras) + sumarMontos(detalleNomina)) * 100) / 100;
                //Retornamos los valores, tanto los totales como las listas completas de todos los detalles de cada ingreso o egreso
                callback(null, new ReporteFinanza(
                    fechaInicio, fechaFin, ingresos, egresos,
                    Math.round((ingresos - egresos) * 100) / 100,
                    detalleVentas, detalleCompras, detalleNomina
                ));
            });
        });
    });
}
//Exportamos las funciones para que el router las pueda utilizar

module.exports = {
    obtenerReporteFinanza,
};