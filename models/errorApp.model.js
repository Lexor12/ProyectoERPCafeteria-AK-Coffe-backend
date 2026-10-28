//Es el error que el controller le manda a la ruta: lleva el código HTTP y el mensaje
//así la ruta solo responde con error.status y error.mensaje, sin adivinar nada
class ErrorApp{
    constructor(status,mensaje){
        this.status=status
        this.mensaje=mensaje
    }
}
module.exports={ErrorApp}