//Este modelo representa como tal un pedido, con su id de venta, y los detalles de esa venta junto con los productos
// y datos básicos del cliente, este se usa para mandar por pedido los datos completos del comprador y todo
class Pedido{
    constructor(idVenta,fechaCompra,totalPagado,entregado,cancelado,rfcCliente,nombreCliente,apellidoCliente,productos){
        this.idVenta=idVenta
        this.fechaCompra=fechaCompra
        this.totalPagado=totalPagado
        this.entregado=entregado
        this.cancelado=cancelado
        this.rfcCliente=rfcCliente
        this.nombreCliente=nombreCliente
        this.apellidoCliente=apellidoCliente
        this.productos=productos // arreglo de ProductoDeVenta
    }
}
module.exports={Pedido}