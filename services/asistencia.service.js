const db = require('../config/db');
const {Asistencia} =require('../models/asistencia.model')

// Trae el historial de asistencias de UN trabajador
function obtenerAsistencias(idTrabajador, callback) {
    //Declaramos la sentencia que se manda a la base de datos
    const sentencia = `
        SELECT
            id_asistencia AS idAsistencia,
            id_trabajador AS idTrabajador,
            fecha,
            hora_entrada AS horaEntrada,
            hora_salida AS horaSalida
        FROM Asistencia
        WHERE id_trabajador = ?
        ORDER BY fecha DESC
    `;
    db.query(sentencia, [idTrabajador], (error, resultados) => {
        //Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
        if (error) {
            callback(error, null);
            return;
        }
        const asistencias=resultados.map(elemento=> new Asistencia(
            elemento.idAsistencia,
            elemento.idTrabajador,
            elemento.fecha,
            elemento.horaEntrada,
            elemento.horaSalida
        ))
        //Si todo sale bien, simplemente retornamos todo el conjunto de asistencias de un trabajador
        callback(null, asistencias);
    });
}

function contarAsistencias(idTrabajador, fechaInicio, fechaFin,callback){
    //Declaramos la sentencia que se manda a la base de datos
    const sentencia = `
        SELECT COUNT(*) AS totalAsistencias
        FROM Asistencia
        WHERE id_trabajador = ?
        AND fecha BETWEEN ? AND ?
    `;
    db.query(sentencia, [idTrabajador, fechaInicio, fechaFin], (error, resultados) => {
        //Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
        if (error) {
            callback(error, null);
            return;
        }
        // Devolvemos el número total de asistecnias obtenido en la consulta
        const total = resultados[0].totalAsistencias;
        //Si todo sale bien, simplemente retornamos un valor del total de asistencias por dicho profesor mandado en el parametro
        callback(null, total);
    });
}

// Registra la asistencia diaria de un trabajador
function registrarAsistencia(idAsistencia,idTrabajador, fecha, horaEntrada, horaSalida, callback) {
    //Declaramos la sentencia que se manda a la base de datos
    const sentencia = `
        INSERT INTO Asistencia (id_asistencia, id_trabajador, fecha, hora_entrada, hora_salida)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sentencia, [idAsistencia, idTrabajador, fecha, horaEntrada, horaSalida], (error, resultado) => {
        //Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
        if (error) {
            callback(error, null);
            return;
        }
        //Si todo sale bien, simplemente retornamos un valor de estado del proceso y el ID
        callback(null, { registrada: true, idAsistencia });
    });
}
//Exportamos todas las funciones para que sean utilizadas por los controllers

module.exports = {
    obtenerAsistencias,
    registrarAsistencia,
    contarAsistencias
};