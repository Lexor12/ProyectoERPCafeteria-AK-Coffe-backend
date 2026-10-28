//Resultado de una acción: respuesta de registrar una venta (idVenta y mensaje son opcionales)
class RespuestaVenta{
    constructor(registrada,idVenta,mensaje){
        this.registrada=registrada
        this.idVenta=idVenta
        this.mensaje=mensaje
    }
}
module.exports={RespuestaVenta}