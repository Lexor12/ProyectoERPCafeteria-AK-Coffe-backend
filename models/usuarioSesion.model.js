//Lo mínimo que se guarda dentro del token y que el middleware deja en req.usuario
class UsuarioSesion{
    constructor(idUsuario,nombre,apellido,rol){
        this.idUsuario=idUsuario
        this.nombre=nombre
        this.apellido=apellido
        this.rol=rol // 'administrador' o 'cliente'
    }
}
module.exports={UsuarioSesion}