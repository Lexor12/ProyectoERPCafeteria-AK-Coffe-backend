//Resultado de una acción: respuesta de iniciar el pago con PayPal
class RespuestaPago{
    constructor(iniciado,enlacePago,orderID){
        this.iniciado=iniciado
        this.enlacePago=enlacePago
        this.orderID=orderID
    }
}
module.exports={RespuestaPago}