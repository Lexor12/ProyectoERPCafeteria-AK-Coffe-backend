const crypto = require('crypto');
const db = require('../config/db');

// Trae el historial de asistencias de UN trabajador
function obtenerAsistencias(idTrabajador, callback) {
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
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultados);
    });
}

// Registra la asistencia diaria de un trabajador y como no se permite
// registrar asistencia en domingo, lo validamos aqui mismo con la fecha que llega
function registrarAsistencia(idTrabajador, fecha, horaEntrada, horaSalida, callback) {
    // new Date(fecha).getDay() regresa 0 para domingo, 1 para lunes, etc, es una función
    // nativa de JavaScript para saber qué día de la semana cae una fecha
    const diaSemana = new Date(fecha).getDay();
    if (diaSemana === 0) {
        callback(null, { registrada: false, mensaje: 'No se puede registrar asistencia en domingo' });
        return;
    }

    const idAsistencia = crypto.randomUUID();
    const sentencia = `
        INSERT INTO Asistencia (id_asistencia, id_trabajador, fecha, hora_entrada, hora_salida)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sentencia, [idAsistencia, idTrabajador, fecha, horaEntrada, horaSalida || null], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, { registrada: true, idAsistencia });
    });
}

module.exports = {
    obtenerAsistencias,
    registrarAsistencia,
};