//Este modelo muestra los datos de un pedido pero desde la vista de un administrador (no manda todos los datos)
class PedidoAdmin{
    constructor(idVenta,fechaCompra,totalPagado,entregado,cancelado,nombreCliente,apellidoCliente,productos){
        this.idVenta=idVenta
        this.fechaCompra=fechaCompra
        this.totalPagado=totalPagado
        this.entregado=entregado
        this.cancelado=cancelado
        this.nombreCliente=nombreCliente
        this.apellidoCliente=apellidoCliente
        this.productos=productos // arreglo de ProductoDeVenta
    }
}
module.exports={PedidoAdmin}