//Resultado de una acción (no es entidad de la BD): lo que recibe Angular tras un login correcto
class RespuestaLogin{
    constructor(token,nombre,apellido,correo,rol){
        this.token=token
        this.nombre=nombre
        this.apellido=apellido
        this.correo=correo
        this.rol=rol // el componente lo usa para decidir a dónde redirigir
    }
}
module.exports={RespuestaLogin}