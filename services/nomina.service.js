const db = require('../config/db');

// Calcula la nómina de un trabajador para un rango de fechas, aqui el total se calcula multiplicando el salario 
// diario por los días con asistencia registrada dentro del rango, tal como pide el requerimiento
function calcularNomina(idTrabajador, fechaInicio, fechaFin, callback) {
    const sentenciaTrabajador = `
        SELECT nombre, apellido, area, rfc, salario
        FROM Trabajador
        WHERE id_trabajador = ?
    `;
    db.query(sentenciaTrabajador, [idTrabajador], (error, resultadosTrabajador) => {
        if (error) {
            callback(error, null);
            return;
        }

        const trabajador = resultadosTrabajador[0];
        if (!trabajador) {
            callback(null, null);
            return;
        }

        const sentenciaAsistencias = `
            SELECT COUNT(*) AS diasTrabajados
            FROM Asistencia
            WHERE id_trabajador = ? AND fecha BETWEEN ? AND ?
        `;
        db.query(sentenciaAsistencias, [idTrabajador, fechaInicio, fechaFin], (error, resultadosAsistencia) => {
            if (error) {
                callback(error, null);
                return;
            }

            const diasTrabajados = Number(resultadosAsistencia[0].diasTrabajados);
            const salarioDiario = Number(trabajador.salario); // directo, sin dividir
            const totalAPagar = salarioDiario * diasTrabajados;

            callback(null, {
                nombre: trabajador.nombre,
                apellido: trabajador.apellido,
                area: trabajador.area,
                rfc: trabajador.rfc,
                fechaInicio,
                fechaFin,
                diasTrabajados,
                salarioDiario,
                totalAPagar,
            });
        });
    });
}

module.exports = {
    calcularNomina,
};