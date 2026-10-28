//Resultado de una acción: respuesta de una compra a un proveedor (los demás campos son opcionales)
class RespuestaCompra{
    constructor(registrada,idProducto,idCompra,total,mensaje){
        this.registrada=registrada
        this.idProducto=idProducto
        this.idCompra=idCompra
        this.total=total
        this.mensaje=mensaje
    }
}
module.exports={RespuestaCompra}