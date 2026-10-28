//Pedido visto desde el Cliente; incluye los datos fiscales de la tienda (vienen de config/tienda.js)
class PedidoCliente{
    constructor(idVenta,fechaCompra,totalPagado,entregado,cancelado,rfcCliente,nombreCliente,apellidoCliente,
                nombreTienda,rfcTienda,telefonoTienda,domicilioFiscalTienda,regimenFiscalTienda,productos,correoCliente){
        this.idVenta=idVenta
        this.fechaCompra=fechaCompra
        this.totalPagado=totalPagado
        this.entregado=entregado
        this.cancelado=cancelado
        this.rfcCliente=rfcCliente
        this.nombreCliente=nombreCliente
        this.apellidoCliente=apellidoCliente
        this.correoCliente=correoCliente
        this.nombreTienda=nombreTienda
        this.rfcTienda=rfcTienda
        this.telefonoTienda=telefonoTienda
        this.domicilioFiscalTienda=domicilioFiscalTienda
        this.regimenFiscalTienda=regimenFiscalTienda
        this.productos=productos // arreglo de ProductoDeVenta
    }
}
module.exports={PedidoCliente}