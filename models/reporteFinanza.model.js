//Este modelo muestra todo lo que es un repprte de finanzas y contabilidad de un rango de fechas
//Aqui se muestran tantos los ingresos (ventas) como los egresos (pagos de nomina y compras de productos)
//En este caso, aqui se mandan los totales de ingresos, egresos y el balance total, junto con listas que llevan cada detalle de venta/compra/nomina
class ReporteFinanza{
    constructor(fechaInicio,fechaFin,ingresos,egresos,balance,detalleVentas,detalleCompras,detalleNomina){
        this.fechaInicio=fechaInicio
        this.fechaFin=fechaFin
        this.ingresos=ingresos
        this.egresos=egresos
        this.balance=balance
        this.detalleVentas=detalleVentas   // arreglo de DatoFinanciero (un monto por día)
        this.detalleCompras=detalleCompras // arreglo de DatoFinanciero (un monto por día)
        this.detalleNomina=detalleNomina   // arreglo de DatoFinanciero (un monto por día)
    }
}
module.exports={ReporteFinanza}