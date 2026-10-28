//El controller aplica la lógica: validaciones, hashear contraseñas, compararlas y generar el token
const authService = require('../services/auth.service');
const validadores = require('../config/validadores');
const bcrypt = require('bcrypt'); // Para hashear y comparar contraseñas
const jwt = require('jsonwebtoken'); // Para crear el token de sesión
const { ErrorApp } = require('../models/errorApp.model');
const { RespuestaRegistro } = require('../models/respuestaRegistro.model');
const { RespuestaLogin } = require('../models/respuestaLogin.model');

//Esta función permite registrar nuevos usuarios, los datos se mandan desde la ruta y aqui se validan
async function registro(nombre,apellido,correo,password,telefono,confirmacionTerminosYCondiciones,callback) {
    //Primero comprobamos que los parametros requeridos realmente tengan datos, si uno falta damos error
    if(!nombre||!apellido||!correo||!password||!telefono ||!confirmacionTerminosYCondiciones){
        callback(new ErrorApp(400,'Faltan campos obligatorios'),null)
        return;
    }
    //Debe ser exactamente true: un texto o un número no cuentan como aceptación
    if(confirmacionTerminosYCondiciones!==true){//Si no acepta los terminos estariamos en problemas legales
        callback(new ErrorApp(400, 'El sistema exige que los Términos y Condiciones sean leidos y aceptados'), null);
        return;
    }
    //Ahora, para validar los demás parametros usamos los validadores que definí previamente en config/validadores
    if (!validadores.esNombreValido(nombre)) {//Comprobamos que el nombre sea entre 2 y 50 caracteres
        callback(new ErrorApp(400, 'El nombre solo acepta letras y espacios, entre 2 y 50 caracteres'), null);
        return;
    }
    if (!validadores.esNombreValido(apellido)) {//Comprobamos que el apellido sea entre 2 y 50
        callback(new ErrorApp(400, 'El apellido solo acepta letras y espacios, entre 2 y 50 caracteres'), null);
        return;
    }
    if (!validadores.esCorreoValido(correo)) {//Verificamos que el correo sea valido y de 100 caracteres
        callback(new ErrorApp(400, 'El correo no tiene un formato válido'), null);
        return;
    }
    if (!validadores.esContrasenaValida(password)) {//Verificamos que la contraseña tenga un formato adecuado
        callback(new ErrorApp(400, 'La contraseña debe tener entre 8 y 64 caracteres, con al menos una mayúscula y un número'), null);
        return;
    }
    if (!validadores.esTelefonoValido(telefono)) {//Lo mismo con el teléfono, debe ser de 10 digitos
        callback(new ErrorApp(400, 'El teléfono debe tener exactamente 10 dígitos'), null);
        return;
    }

    let passwordHash;//Las contraseñas jamas se guardan en texto plano, estas deben estar guardadas en hash
    try{
        passwordHash=await bcrypt.hash(password,10);//Hasheamos con 10 rondas para no guardar la contraseña directamente
    }catch(error){//Si no podemos hashear la contraseña directamente damos error, ya que no podemos guardar una contraseña que nunca podremos validar
        callback(new ErrorApp(500, 'Error al registrar el usuario'), null);
        return;
    }
    // El rol 'cliente' lo asigna el service con el SELECT a la tabla Rol
    authService.registrarUsuario(nombre,apellido,correo,passwordHash,telefono,(error)=>{
        if(error){
            if (error.code === 'ER_DUP_ENTRY') { //Como el correo es unico, si nos da este error notificamos de que el correo ya existe
                callback(new ErrorApp(409, 'Ese correo ya está registrado'), null);
                return;
            }
            callback(new ErrorApp(500, 'Error al registrar el usuario'), null);
            return;
        }
        callback(null, new RespuestaRegistro(true, 'Usuario registrado correctamente'));
    });
}
// Recibe un correo y una contraseña, y se encarga de verificar que sean correctos, en caso de serlo emite un token
function login(correo, password,callback){
    //Primero evaluamos que realmente el usuario haya ingresado una contraseña y correo y que sean texto, para poder evaluarlos después
    if (!correo || !password || typeof correo !== 'string' || typeof password !== 'string') {
        callback(new ErrorApp(400, 'Correo y contraseña son obligatorios'), null);
        return;
    }
    if (!validadores.esCorreoValido(correo)) {//Verificamos que el correo sea valido, nuevamente máximo 100 caracteres
        callback(new ErrorApp(400, 'El correo no tiene un formato válido'), null);
        return;
    }
    authService.buscarUsuarioPorCorreo(correo,async(error,usuario)=>{//Si lo además es correcto, ahora simplemente validamos las credenciales
        //Primero buscamos al usuario por el correo, si se llega a encontrar significa que efectivamente si hay un usuario
        if (error) {
            callback(new ErrorApp(500, 'Error al iniciar sesión'), null);//Si directamente no se encuentra el usuario, significa que las credenciales son erroneas
            return;
        }
        // Mismo mensaje si el correo no existe, está desactivado o la contraseña falla, para no dar pistas
        if (!usuario || !usuario.activo) {
            callback(new ErrorApp(401, 'Credenciales inválidas'), null);
            return;
        }
        // Comparamos la contraseña escrita contra el hash guardado
        let passwordValido;
        try{
            passwordValido=await bcrypt.compare(password,usuario.passwordHash);//Aqui guardamos el resultado de comparar lo ingresado con el hash de la base de datos
        }catch(error){
            callback(new ErrorApp(500, 'Error al iniciar sesión'), null);//Si hay un error al comparar decimos que directamente hubo un eror
            return;
        }
        if (!passwordValido) {//En caso de que la contraseña sea no la misma mandamos un error
            callback(new ErrorApp(401, 'Credenciales inválidas'), null);
            return;
        }
        //Creamos un token jwt que almacena el idUsuario nadamas, ya que en cada petición solo analizamos estos datos
        const token=jwt.sign(
            { idUsuario: usuario.idUsuario },
            process.env.JWT_SECRET,//Guardamos nuestra clave única para identificar un token que si es adecuado
            {expiresIn:'1h'}//El token dura máximo 1 hora
        )
        // Esto es lo que recibe Angular, aqui mandamos el token y los datos básicos del usuario
        callback(null, new RespuestaLogin(token, usuario.nombre, usuario.apellido, usuario.correo, usuario.rol));
    })
}
module.exports = { registro, login };//Exportamos las funciones para que el router las pueda utilizar