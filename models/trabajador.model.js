class Trabajador {
    constructor(idTrabajador, nombre, apellido, area, fechaIngreso, salario, rfc, horaEntrada, horaSalida) {
        this.idTrabajador = idTrabajador;
        this.nombre = nombre;
        this.apellido = apellido;
        this.area = area;
        this.fechaIngreso = fechaIngreso;
        this.salario = salario;
        this.rfc = rfc;
        this.horaEntrada = horaEntrada;
        this.horaSalida = horaSalida;
    }
}
module.exports = Trabajador;