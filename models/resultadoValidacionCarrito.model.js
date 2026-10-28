//Resultado de validar el carrito contra el stock real antes de pagar
class ResultadoValidacionCarrito{
    constructor(valido,excedidos){
        this.valido=valido
        this.excedidos=excedidos // arreglo de ItemCarrito que no alcanzan (opcional)
    }
}
module.exports={ResultadoValidacionCarrito}