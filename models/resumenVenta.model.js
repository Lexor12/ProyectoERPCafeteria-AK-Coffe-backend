//Resultado de calcular una compra con los precios y el stock reales de la base de datos
class ResumenVenta{
    constructor(subtotal,iva,total,items,excedidos){
        this.subtotal=subtotal
        this.iva=iva
        this.total=total
        this.items=items// arreglo de ItemVenta que sí se pueden vender
        this.excedidos=excedidos// arreglo de ItemCarrito que no existen, están desactivados o no alcanzan
    }
}
module.exports={ResumenVenta}