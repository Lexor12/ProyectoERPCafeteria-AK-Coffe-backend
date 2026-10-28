//El service es el único que habla con la base de datos (consultas SQL), sin lógica
const db = require('../config/db');
const { Usuario } = require('../models/usuario.model');

// Inserta un usuario nuevo, siempre con rol 'cliente'
// El passwordHash ya viene hasheado desde el controller aqui solamente lo mandamos
function registrarUsuario(nombre,apellido,correo,passwordHash,telefono, callback) {
    const sentencia = `
        INSERT INTO Usuario (correo, password_hash, nombre, apellido, telefono, id_rol)
        VALUES (?, ?, ?, ?, ?, (SELECT id_rol FROM Rol WHERE nombre = 'cliente'))
    `;//Con esta sentencia insertamos un usuario nuevo dentro de la base de datos
    //por defecto cualquier usuario que ingresa es de tipo cliente
    const valores = [correo, passwordHash, nombre, apellido, telefono];
    db.query(sentencia, valores, (error, resultado) => {
        //Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
        if (error) {
            callback(error, null); // El controller decide qué significa (ej. ER_DUP_ENTRY = correo repetido)
            return;
        }
        //Si todo sale bien, mandamos el resultado de la base de datos
        callback(null, resultado);
    });
}

// Busca un usuario por correo y trae el nombre de su rol (JOIN con Rol)
// Si no existe regresa null; el controller decide qué hacer con eso
function buscarUsuarioPorCorreo(correo, callback) {
    //Declaramos la sentencia que se manda a la base de datos
    const sentencia = `
        SELECT
            u.id_usuario AS idUsuario,
            u.correo,
            u.password_hash AS passwordHash,
            u.nombre,
            u.apellido,
            u.telefono,
            u.activo,
            r.nombre AS rol
        FROM Usuario u
        JOIN Rol r ON r.id_rol = u.id_rol
        WHERE u.correo = ?
    `;
    db.query(sentencia, [correo], (error, resultados) => {
        //Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
        if (error) {
            callback(error, null);
            return;
        }
        const fila = resultados[0];//Como solo esperamos un resultado, obtenemos del arreglo el primero
        if (!fila) {//En caso de que no exista y sea null mandamos a error
            callback(null, null);
            return;
        }
        callback(null, new Usuario(//Si todo sale bien, retornamos los datos del usuario completo usando el Model
            fila.idUsuario, fila.correo, fila.passwordHash, fila.nombre,
            fila.apellido, fila.telefono, !!fila.activo, fila.rol
        ));
    });
}

// Busca un usuario por id y trae el nombre de su rol (JOIN con Rol)
// Si no existe regresa null; el controller decide qué hacer con eso
function buscarUsuarioPorId(idUsuario, callback) {
    //Declaramos la sentencia que se manda a la base de datos
    const sentencia = `
        SELECT
            u.id_usuario AS idUsuario,
            u.correo,
            u.password_hash AS passwordHash,
            u.nombre,
            u.apellido,
            u.telefono,
            u.activo,
            r.nombre AS rol
        FROM Usuario u
        JOIN Rol r ON r.id_rol = u.id_rol
        WHERE u.id_usuario = ?
    `;
    db.query(sentencia, [idUsuario], (error, resultados) => {
        //Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
        if (error) {
            callback(error, null);
            return;
        }
        const fila = resultados[0];//Como solo esperamos un resultado, obtenemos del arreglo el primero
        if (!fila) {//En caso de que no exista y sea null mandamos a error
            callback(null, null);
            return;
        }
        callback(null, new Usuario(//Si todo sale bien, retornamos los datos del usuario completo usando el Model
            fila.idUsuario, fila.correo, fila.passwordHash, fila.nombre,
            fila.apellido, fila.telefono, !!fila.activo, fila.rol
        ));
    });
}
//Exportamos todas las funciones para que sean utilizadas por los controllers
module.exports = {
    registrarUsuario,
    buscarUsuarioPorCorreo,
    buscarUsuarioPorId
};