const db = require('../config/db');

// Registra un nuevo usuario, siempre con rol 'cliente'
// PEROOO se guarda la contraseña tal cual, sin hash todavía
function registrarUsuario(datos, callback) {
    const sentencia = `
        INSERT INTO Usuario (correo, password_hash, nombre, apellido, telefono, id_rol)
        VALUES (?, ?, ?, ?, ?, (SELECT id_rol FROM Rol WHERE nombre = 'cliente'))
    `;
    const valores = [datos.correo, datos.password, datos.nombre, datos.apellido, datos.telefono];

    db.query(sentencia, valores, (error, resultado) => {
        if (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                //En caso de que de error, es porque el correo ya existe
                callback({ correoDuplicado: true }, null);
                return;
            }
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

// Verifica correo + contraseña y regresa los datos básicos del usuario si son correctos
//Como aun no debemos de poner lógica de backend, la comparación es en texto plano, sin hash todavía sin generar token todavía
function iniciarSesion(correo, password, callback) {
    const sentencia = `
        SELECT
            u.id_usuario AS idUsuario,
            u.nombre,
            u.apellido,
            u.correo,
            u.password_hash AS passwordGuardado,
            u.activo,
            r.nombre AS rol
        FROM Usuario u
        JOIN Rol r ON r.id_rol = u.id_rol
        WHERE u.correo = ?
    `;
    db.query(sentencia, [correo], (error, resultados) => {
        if (error) {
            callback(error, null);
            return;
        }
        const usuario = resultados[0];
        if (!usuario || !usuario.activo || usuario.passwordGuardado !== password) {
            // Por seguridad no distinguimos si falló el correo o la contraseña
            callback(null, { autenticado: false });
            return;
        }
        callback(null, {
            autenticado: true,
            idUsuario: usuario.idUsuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo,
            rol: usuario.rol,
        });
    });
}

module.exports = {
    registrarUsuario,
    iniciarSesion,
};