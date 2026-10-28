//Este modelo representa a un proveedor, este solo tiene un nombre y telefono (y estado: activo/inactivo)
//Este se manda al consultar los proveedores desde la sección de proveedores del frontend
class Proveedor{
    constructor(idProveedor,nombre,telefono,activo){
        this.idProveedor=idProveedor
        this.nombre=nombre
        this.telefono=telefono
        this.activo=activo//"activo" no está en la interfaz de Angular pero el backend ya lo mandaba
    }
}
module.exports={Proveedor}