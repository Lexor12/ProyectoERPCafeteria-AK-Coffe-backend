//Este modelo representa el calculo de una nómina especifica de un trabajador en un rango de fechas, según sus asistencias
//Aquí solo retornamos los datos básicos de ese trabajador
class Nomina{
    constructor(nombre,apellido,area,rfc,fechaInicio,fechaFin,diasTrabajados,salarioDiario,totalAPagar){
        this.nombre=nombre
        this.apellido=apellido
        this.area=area
        this.rfc=rfc
        this.fechaInicio=fechaInicio
        this.fechaFin=fechaFin
        this.diasTrabajados=diasTrabajados
        this.salarioDiario=salarioDiario
        this.totalAPagar=totalAPagar
    }
}
module.exports={Nomina}