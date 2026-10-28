//RH controllers es una union para todo lo que conlleva la gestion de un trabajador, desde nominas
//asistencias, la entidad en si, aqui se lleva a cabo todo lo relacionado con el modulo rh
const validadores=require('../config/validadores')
const asistenciaService=require('../services/asistencia.service')
const trabajadorService=require('../services/trabajador.service')
const crypto=require('crypto')//Para poder crear las UUID
const { ErrorApp } = require('../models/errorApp.model');
const { Nomina } = require('../models/nomina.model');
//Como esta muy grande este módulo voy a separar por "servicios" o bueno modulos idk

//Trabajadores

//Esta función devuelve todo el conjunto de trabajadores activos, sin ningún filtro
function obtenerTrabajadores(callback){
    trabajadorService.obtenerTrabajadores((error,resultado)=>{
        if(error){//Si el servicio nos da un error, debemos de notificarlo y regrearlo
            callback(new ErrorApp(500,'Error al consultar trabajadores'),null)
            return;
        }
        callback(null,resultado)//Los regresa en un fromato adecuado, el de Trabajadores.model
    })
}

//Esta función permite registrar un nuevo trabajador
function registrarTrabajador(nombre, apellido, area, rfc,fechaIngreso, salario, horaEntrada, horaSalida,callback){
    //Como si estamos ingresando valores debemos comprobarlos antes

    //Todas estas validaciones se encuentran en /config/validaciones
    if (!validadores.esNombreValido(nombre)) {//Comprobamos que sea un nombre valido
        callback( new ErrorApp(400, 'El nombre solo acepta letras y espacios, entre 2 y 50 caracteres'),null);
        return;
    }
    if (!validadores.esNombreValido(apellido)) {
        callback(new ErrorApp(400, 'El apellido solo acepta letras y espacios, entre 2 y 50 caracteres'),null) ;
        return;
    }
    if (!validadores.esLongitudValida(area, 1, 100)) {
        callback(new ErrorApp(400, 'El área es obligatoria y tiene un máximo de 100 caracteres'),null)
        return;
    }
    if (!validadores.esRfcValido(rfc)) {
        callback(new ErrorApp(400, 'El RFC es obligatorio y debe tener entre 12 y 13 caracteres alfanuméricos'),null)
        return ;
    }
    if (!validadores.esDecimalPositivoValido(salario)) {
        callback(new ErrorApp(400, 'El salario diario debe ser un decimal mayor a 0'),null)
        return;
    }
    //Validamos que haya ingresado una hora de entrada como salida adecuada
    if (!horaEntrada || !horaSalida) {
        callback(new ErrorApp(400, 'Falta la hora de entrada o salida de turno'),null)
        return;
    }
    if (!validadores.esHoraFinPosterior(horaEntrada, horaSalida)) {
        callback(new ErrorApp(400, 'La hora de salida de turno debe ser posterior a la hora de entrada'),null);
        return
    }
    if (!validadores.esFechaValida(fechaIngreso)) {
        callback(new ErrorApp(400, 'La fecha de ingreso no es válida'), null);
        return;
    }
    //Nosotros creamos la UUID desde aqui el backend, aunque no hay mucha diferencia entre crearla en BD o aqui, ambas son random y unicas idealmente
    const idTrabajador=crypto.randomUUID();
    trabajadorService.crearTrabajador(idTrabajador,nombre, apellido, area, rfc,fechaIngreso, salario, horaEntrada, horaSalida,(error)=>{
        if(error){//Si el servicio nos da un error, debemos de notificarlo y regrearlo
            callback(new ErrorApp(500, 'Error al registrar el trabajador'),null)
            return;
        }
        callback(null,true)//Avisamos que si se logro la insercion, no necesitamos mandar datos, solo retroalimentacion de Si/No
    })
}
//Ahora vamos con la funcion que permite editar a un trabajador ya existente
function editarTrabajador(idTrabajador, nombre, apellido, area, rfc,salario, horaEntrada, horaSalida,callback){
    //Como si estamos ingresando valores debemos comprobarlos antes
    if(!validadores.esUuidValido(idTrabajador)){//Primero verificamos que el id sea adecuado, ya que como estamos editando aqui SI necesitamos una id
        callback(new ErrorApp(400, 'El id del trabajador no es válido'),null)
    }
    //Todas estas validaciones se encuentran en /config/validaciones
    if (!validadores.esNombreValido(nombre)) {//Comprobamos que sea un nombre valido
        callback( new ErrorApp(400, 'El nombre solo acepta letras y espacios, entre 2 y 50 caracteres'),null);
        return;
    }
    if (!validadores.esNombreValido(apellido)) {
        callback(new ErrorApp(400, 'El apellido solo acepta letras y espacios, entre 2 y 50 caracteres'),null) ;
        return;
    }
    if (!validadores.esLongitudValida(area, 1, 100)) {
        callback(new ErrorApp(400, 'El área es obligatoria y tiene un máximo de 100 caracteres'),null)
        return;
    }
    if (!validadores.esRfcValido(rfc)) {
        callback(new ErrorApp(400, 'El RFC es obligatorio y debe tener entre 12 y 13 caracteres alfanuméricos'),null)
        return ;
    }
    if (!validadores.esDecimalPositivoValido(salario)) {
        callback(new ErrorApp(400, 'El salario diario debe ser un decimal mayor a 0'),null)
        return;
    }
    //Validamos que haya ingresado una hora de entrada como salida adecuada
    if (!horaEntrada || !horaSalida) {
        callback(new ErrorApp(400, 'Falta la hora de entrada o salida de turno'),null)
        return;
    }
    if (!validadores.esHoraFinPosterior(horaEntrada, horaSalida)) {
        callback(new ErrorApp(400, 'La hora de salida de turno debe ser posterior a la hora de entrada'),null);
        return
    }
    trabajadorService.editarTrabajador(idTrabajador,nombre, apellido, area, rfc,salario, horaEntrada, horaSalida,(error,resultado)=>{
        if (error) {//Si el servicio nos da un error, debemos de notificarlo y regrearlo
            callback(new ErrorApp(500, 'Error al editar el trabajador'), null);
            return;
        }
        if (resultado.affectedRows === 0) {
            callback(new ErrorApp(404, 'Trabajador no encontrado'), null);
            return;
        }
        callback(null, true);
    })
}

//Ahora, vamos con la funcion que permite desactivar a un trabajador, esta se usa para "eliminarlo"
//pero a la vez no, es un soft delete para poder conservar historial y asi
function cambiarActivoTrabajador(idTrabajador, activo, callback){
    //Como si estamos ingresando valores debemos comprobarlos antes
    if(!validadores.esUuidValido(idTrabajador)){//Primero verificamos que el id sea adecuado, ya que como estamos editando aqui SI necesitamos una id
        callback(new ErrorApp(400, 'El id del trabajador no es válido'),null)
    }
    if (typeof activo !== 'boolean') {
        callback(new ErrorApp(400, 'El campo activo debe ser true o false'), null);
        return;
    }
    trabajadorService.cambiarEstadoActivoTrabajador(idTrabajador, activo, (error, resultado) => {
        if (error) {//Si el servicio nos da un error, debemos de notificarlo y regrearlo
            callback(new ErrorApp(500, 'Error al actualizar el trabajador'), null);
            return;
        }
        if (resultado.affectedRows === 0) {
            callback(new ErrorApp(404, 'Trabajador no encontrado'), null);
            return;
        }
        callback(null, true);
    });
}

// Ahora siguen las funciones de asistencias 

//Esta función permite obtener todas las asistencias registradas de un profesor
function obtenerAsistencias(idTrabajador,callback){
    //Como si estamos ingresando valores debemos comprobarlos antes
    if(!validadores.esUuidValido(idTrabajador)){//Primero verificamos que el id sea adecuado, ya que como estamos editando aqui SI necesitamos una id
        callback(new ErrorApp(400, 'El id del trabajador no es válido'),null)
    }
    asistenciaService.obtenerAsistencias(idTrabajador,(error,asistencias)=>{
        if(error){
            callback(new ErrorApp(500,'Error al consultar las asistencias',null))
            return;
        }
        callback(null,asistencias)
    })
}
//Esta funcion permite registrar asistencias
function registrarAsistencia(idTrabajador,fecha,horaEntrada,horaSalida, callback) {
    //Como si estamos ingresando valores debemos comprobarlos antes
    if(!validadores.esUuidValido(idTrabajador)){//Primero verificamos que el id sea adecuado, ya que como estamos editando aqui SI necesitamos una id
        callback(new ErrorApp(400, 'El id del trabajador no es válido'),null)
    }
    if (!validadores.esFechaValida(fecha)) {
        callback(new ErrorApp(400, 'La fecha no es válida'), null);
        return;
    }
    if (!validadores.esHoraFinPosterior(horaEntrada, horaSalida)) {
        callback(new ErrorApp(400, 'La hora de salida debe ser posterior a la hora de entrada'), null);
        return;
    }
    const [anio, mes, dia] = fecha.split('-').map(Number);
    if(new Date(anio, mes - 1, dia).getDay() === 0){
        callback(new ErrorApp(400, 'No se puede registrar asistencias en domingo'), null);
        return;
    }
    //Ahora, tenemos que comprobar que el trabajador si se encuentre activo
    trabajadorService.obtenerTrabajadorPorId(idTrabajador,(error,trabajador)=>{
        if (error) {//Si no encontramos al trabajador no podemos registrar la asistencia asi que mandamos error
            callback(new ErrorApp(500, 'Error al registrar la asistencia'), null);
            return;
        }
        if (!trabajador) {//Lo mismo, si no hay trabajador, hay error
            callback(new ErrorApp(500, 'El trabajador no existe'),null);
            return;
        }
        if (!trabajador.activo) {//Si el trabajador no esta activo mandamos error
            callback(new ErrorApp(500, 'No se puede registrar asistencia de un trabajador desactivado'),null);
            return;
        }
        const idAsistencia=crypto.randomUUID();//Creamos un UUID para registrar en la base de datos una fila nueva
        asistenciaService.registrarAsistencia(idAsistencia,idTrabajador,fecha,horaEntrada,horaSalida,(error)=>{
            if (error) {//Si el servicio nos da un error, debemos de notificarlo y regrearlo
                if (error.code === 'ER_DUP_ENTRY') {//Si ya existe una asistencia de ese mismo día no podemos tener otra
                    callback(new ErrorApp(409, 'Ya existe un registro de asistencia para este trabajador en este día'), null);
                    return;
                }
                callback(new ErrorApp(500, 'Error al registrar la asistencia'), null);
                return;
            }
            callback(null, true);
        })
    })
}

// Ahora sigue la parte de la nomina, en esta versión ya no existe como tal un service, lo borre, ya que ese service lo único que hacia era llamar a sentencias que otros services ya hacia (trabajador y asistencia)
// Esta función permite calcular la nomina o pago de un trabajador según sus asistencias en cuanto a un rango de fecha dado
function calcularNomina(idTrabajador, fechaInicio, fechaFin, callback) {
    //Como si estamos ingresando valores debemos comprobarlos antes
    if(!validadores.esUuidValido(idTrabajador)){//Primero verificamos que el id sea adecuado, ya que como estamos editando aqui SI necesitamos una id
        callback(new ErrorApp(400, 'El id del trabajador no es válido'),null)
    }
    if (!fechaInicio || !fechaFin) {
        callback(new ErrorApp(400, 'Se requiere fechaInicio y fechaFin'),null)
        return;
    }
    if (!validadores.esFechaValida(fechaInicio) || !validadores.esFechaValida(fechaFin)) {
        callback(new ErrorApp(400, 'Las fechas no tienen un formato válido'),null)
        return;
    }
    if (new Date(fechaInicio) > new Date(fechaFin)) {
        callback(new ErrorApp(400, 'fechaInicio no puede ser posterior a fechaFin'),null)
        return;
    }
    trabajadorService.obtenerTrabajadorPorId(idTrabajador, (error, trabajador) => {
        if (error) {//Si el servicio nos da un error, debemos de notificarlo y regrearlo
            callback(new ErrorApp(500, 'Error al calcular la nómina'), null);
            return;
        }
        if (!trabajador) {
            callback(new ErrorApp(404, 'Trabajador no encontrado'), null);
            return;
        }
        asistenciaService.contarAsistencias(idTrabajador, fechaInicio, fechaFin, (error, diasTrabajados) => {
            if (error) {//Si el servicio nos da un error, debemos de notificarlo y regrearlo
                callback(new ErrorApp(500, 'Error al calcular la nómina'), null);
                return;
            }
            const totalAPagar = Math.round((trabajador.salario * diasTrabajados) * 100) / 100;
            callback(null, new Nomina(
                trabajador.nombre, trabajador.apellido, trabajador.area, trabajador.rfc,
                fechaInicio, fechaFin, diasTrabajados, trabajador.salario, totalAPagar
            ));
        });
    });
}
//Exportamos las funciones para que el router las pueda utilizar
module.exports = {
    obtenerTrabajadores,
    registrarTrabajador,
    editarTrabajador,
    cambiarActivoTrabajador,
    obtenerAsistencias,
    registrarAsistencia,
    calcularNomina,
};
