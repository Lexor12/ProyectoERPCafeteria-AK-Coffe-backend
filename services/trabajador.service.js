const crypto = require('crypto');//Volvemos a importar esto, para que cuando agreguemos un trabajador podamos obtener su UUID, y para procesos diferentes aqui poder usar el mismo
const db = require('../config/db');

function obtenerTrabajadores(callback) {
    let sentencia = `
        SELECT
            id_trabajador AS idTrabajador,
            nombre,
            apellido,
            area,
            rfc,
            fecha_ingreso AS fechaIngreso,
            salario,
            hora_entrada_turno AS horaEntrada,
            hora_salida_turno AS horaSalida,
            activo
        FROM Trabajador
        WHERE activo = TRUE
    `;
    const valores = [];

    db.query(sentencia, valores, (error, resultados) => {
        if (error) {
            callback(error, null);
            return;
        }
        const resultadosConvertidos = resultados.map(t => ({
            ...t,
            salario: Number(t.salario)
        }));
        callback(null, resultadosConvertidos);
    });
}

function crearTrabajador(datos, callback) {
    const idTrabajador = crypto.randomUUID();
    const sentencia = `
        INSERT INTO Trabajador (id_trabajador, nombre, apellido, area, rfc, fecha_ingreso, salario, hora_entrada_turno, hora_salida_turno)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const valores = [
        idTrabajador, datos.nombre, datos.apellido, datos.area, datos.rfc,
        datos.fechaIngreso, datos.salario, datos.horaEntrada, datos.horaSalida,
    ];
    db.query(sentencia, valores, (error) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, { idTrabajador });
    });
}

function editarTrabajador(idTrabajador, datos, callback) {
    const sentencia = `
        UPDATE Trabajador
        SET nombre = ?, apellido = ?, area = ?, rfc = ?, salario = ?, hora_entrada_turno = ?, hora_salida_turno = ?
        WHERE id_trabajador = ?
    `;
    const valores = [
        datos.nombre, datos.apellido, datos.area, datos.rfc,
        datos.salario, datos.horaEntrada, datos.horaSalida, idTrabajador,
    ];
    db.query(sentencia, valores, (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

function cambiarActivoTrabajador(idTrabajador, activo, callback) {
    const sentencia = 'UPDATE Trabajador SET activo = ? WHERE id_trabajador = ?';
    db.query(sentencia, [activo, idTrabajador], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

module.exports = {
    obtenerTrabajadores,
    crearTrabajador,
    editarTrabajador,
    cambiarActivoTrabajador,
};