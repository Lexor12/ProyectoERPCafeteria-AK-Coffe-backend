//Un producto de la venta ya con el precio real tomado de la base de datos (no el que mande el front)
class ItemVenta{
    constructor(idProducto,cantidad,precioUnitario){
        this.idProducto=idProducto
        this.cantidad=cantidad
        this.precioUnitario=precioUnitario
    }
}
module.exports={ItemVenta}