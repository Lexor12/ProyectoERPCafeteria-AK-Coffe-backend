class DatoFinanciero {
    constructor(fecha, monto) {
        this.fecha = fecha;
        this.monto = monto;
    }
}

class ReporteFinanza {
    constructor(fechaInicio, fechaFin, ingresos, egresos, balance, detalleVentas, detalleCompras) {
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.ingresos = ingresos;
        this.egresos = egresos;
        this.balance = balance;
        this.detalleVentas = detalleVentas;
        this.detalleCompras = detalleCompras;
    }
}

module.exports = {
    DatoFinanciero,
    ReporteFinanza
};