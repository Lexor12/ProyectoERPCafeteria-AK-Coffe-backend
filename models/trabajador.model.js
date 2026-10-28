//Este modelo muestra los datos completos de un trabajador (no asistencias), solo datos de esa entidad como tal
class Trabajador{
    constructor({idTrabajador,nombre,apellido,area,fechaIngreso,salario,rfc,horaEntrada,horaSalida,activo}){
        this.idTrabajador=idTrabajador
        this.nombre=nombre
        this.apellido=apellido
        this.area=area
        this.fechaIngreso=fechaIngreso // yyyy-MM-dd
        this.salario=salario
        this.rfc=rfc
        this.horaEntrada=horaEntrada // HH:mm
        this.horaSalida=horaSalida   // HH:mm
        this.activo=activo
    }
}
module.exports={Trabajador}