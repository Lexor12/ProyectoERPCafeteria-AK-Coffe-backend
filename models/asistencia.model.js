//Este modelo representa la asistencia de un trabajador, se retorna como lista de todas las asistencias
class Asistencia{
    constructor(idAsistencia,idTrabajador,fecha,horaEntrada,horaSalida){
        this.idAsistencia=idAsistencia
        this.idTrabajador=idTrabajador
        this.fecha=fecha
        this.horaEntrada=horaEntrada
        this.horaSalida=horaSalida // puede ser null
    }
}
module.exports={Asistencia}