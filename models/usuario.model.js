//Este modelo representa la entidad de la tabla Usuario de la base de datos, aqui tenemos 
//nombre, correo, contraseña, id, etc etc, todos usados para procesamiento de Backend
class Usuario{
    constructor(idUsuario,correo,passwordHash,nombre,apellido,telefono,activo,rol){
        this.idUsuario=idUsuario
        this.correo=correo
        this.passwordHash=passwordHash
        this.nombre=nombre
        this.apellido=apellido
        this.telefono=telefono
        this.activo=activo
        this.rol=rol // 'administrador' o 'cliente'
    }
}
module.exports={Usuario}