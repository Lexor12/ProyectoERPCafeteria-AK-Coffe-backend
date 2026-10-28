const db = require('../config/db');
const {Trabajador} = require('../models/trabajador.model')

//Esta función retorna todo el conjunto de trabajadores guardados en el sistema
//que se encuentran como activos
function obtenerTrabajadores(callback) {
    //Declaramos la sentencia que se manda a la base de datos
    let sentencia = `
        SELECT
            id_trabajador AS idTrabajador,
            nombre,
            apellido,
            area,
            fecha_ingreso AS fechaIngreso,
            salario,
            rfc,
            hora_entrada_turno AS horaEntrada,
            hora_salida_turno AS horaSalida,
            activo
        FROM Trabajador
        WHERE activo = TRUE
    `;

    db.query(sentencia, (error, resultados) => {
        if (error) {//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error, null);
            return;
        }
        const resultadosConvertidos = resultados.map(elemento => new Trabajador({
            ...elemento,
            salario: Number(elemento.salario)
        }));//Ponemos ... para que se guarden exactamente los valores de la propiedad del otro objeto en este nuevo
        callback(null, resultadosConvertidos);
    });
}
//Esta función permite retornar un trabajador por ID directamente, permite devolver uno usando su Modal (para mandar ciertos datos de manera universal)
function obtenerTrabajadorPorId(idTrabajador,callback) {
    //Declaramos la sentencia que se manda a la base de datos
    let sentencia = `
        SELECT
            id_trabajador AS idTrabajador,
            nombre,
            apellido,
            area,
            fecha_ingreso AS fechaIngreso,
            salario,
            rfc,
            hora_entrada_turno AS horaEntrada,
            hora_salida_turno AS horaSalida,
            activo
        FROM Trabajador
        WHERE id_trabajador = ?
    `;

    db.query(sentencia,[idTrabajador], (error, resultados) => {
        if (error) {//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error, null);
            return;
        }
        const resultado=resultados[0]
        if(!resultado){//Si no existe ese trabajador regresamos null para que el controller decida qué responder
            callback(null,null);
            return;
        }
        const trabajador =  new Trabajador({
            ...resultado,
            salario: Number(resultado.salario)//Ponemos ... para que se guarden exactamente los valores de la propiedad del otro objeto en este nuevo
        })
        callback(null, trabajador);
    });
}
//Esta función se utiliza para registrar a un nuevo trabajador
function crearTrabajador(idTrabajador, nombre, apellido, area, rfc,fechaIngreso, salario, horaEntrada, horaSalida, callback) {
    const sentencia = `
        INSERT INTO Trabajador (id_trabajador, nombre, apellido, area, rfc, fecha_ingreso, salario, hora_entrada_turno, hora_salida_turno)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sentencia, [idTrabajador, nombre, apellido, area, rfc,fechaIngreso, salario, horaEntrada, horaSalida], (error) => {
        if (error) {//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error, null);
            return;
        }
        callback(null, { idTrabajador });
    });
}

//Esta función permite editar todos los campos de un trabajador
function editarTrabajador(idTrabajador, nombre, apellido, area, rfc,salario, horaEntrada, horaSalida, callback) {
    const sentencia = `
        UPDATE Trabajador
        SET nombre = ?, apellido = ?, area = ?, rfc = ?, salario = ?, hora_entrada_turno = ?, hora_salida_turno = ?
        WHERE id_trabajador = ?
    `;
    db.query(sentencia, [nombre, apellido, area, rfc,salario, horaEntrada, horaSalida, idTrabajador,], (error, resultado) => {
        if (error) {//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}
//Esta función permite eliminar a un trabajador directamente, con soft delete
function cambiarEstadoActivoTrabajador(idTrabajador, activo, callback) {
    const sentencia = 'UPDATE Trabajador SET activo = ? WHERE id_trabajador = ?';
    db.query(sentencia, [activo, idTrabajador], (error, resultado) => {
        if (error) {//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}
//Exporotamos todos los módulos, usamos {} ya que tenemos muchas funciones
//Al momento de hacer referencia a una usamos {}, si no, si hacemos referencia a todo un objeto
//pues podemos acceder a el como sus "metodos"
module.exports = {
    obtenerTrabajadores,
    crearTrabajador,
    editarTrabajador,
    cambiarEstadoActivoTrabajador,
    obtenerTrabajadorPorId
};