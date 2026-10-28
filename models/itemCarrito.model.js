//Un elemento del arreglo [{ idProducto, cantidad }] que manda el front al validar o pagar
class ItemCarrito{
    constructor(idProducto,cantidad){
        this.idProducto=idProducto
        this.cantidad=cantidad
    }
}
module.exports={ItemCarrito}