//Resultado de una acción (no es entidad de la BD): respuesta del registro
class RespuestaRegistro{
    constructor(creado,mensaje){
        this.creado=creado
        this.mensaje=mensaje
    }
}
module.exports={RespuestaRegistro}