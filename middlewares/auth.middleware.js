//middlewares
//Los siguientes middlewares permiten
//  analizar cada peticion entrante a cada endpoint (que requiere autorizacion) para filtrar los accesos segun los roles
const jwt = require('jsonwebtoken')
const {UsuarioSesion}=require('../models/usuarioSesion.model')
const authService = require('../services/auth.service')


//Cada peticion debe mandar un Bearer Token, y este se analiza por este mid
function verificarToken(req,res,next){
    const encabezado=req.headers['authorization'];
    if(!encabezado||!encabezado.startsWith('Bearer ')){
        return res.status(401).json({mensaje: 'Se requiere iniciar sesión' })
    }
    if(req.usuario){//Evitamos intentos de suplantacion (igualmente no es posible ya que sobre escribimos)
        return res.status(401).json({mensaje: 'Sesión inválida o expirada' })
    }
    const token=encabezado.split(' ')[1];
    try{
        const datos=jwt.verify(token,process.env.JWT_SECRET);
        authService.buscarUsuarioPorId(datos.idUsuario,(error,usuario)=>{
            if(error|| !usuario){//Si hay error, o si directamente el usuario no fue encontrado retornamos como error
                return res.status(401).json({mensaje: 'Sesión inválida o usuario inexistente' })
            }
            req.usuario=new UsuarioSesion(usuario.idUsuario,usuario.nombre,usuario.apellido,usuario.rol)
            next();
        })
    }
    catch(error){
        return res.status(401).json({mensaje: 'Sesión inválida o expirada' })
    }
}
// Se usa DESPUÉS de verificarToken, ej: permitirRoles('administrador'), permite aplicar el proceso de autorizacion a cierto rol en especifico
function permitirRoles(...rolesPermitidos){
    return (req,res,next)=>{//Si el usuario no posee el rol o alguno de los roles permitidos directamente retorna error
        if(!rolesPermitidos.includes(req.usuario.rol)){
            return res.status(403).json({mensaje: 'No tienes permiso para esta acción' })
        }
        next();
    }
}
module.exports={
    verificarToken,permitirRoles
}