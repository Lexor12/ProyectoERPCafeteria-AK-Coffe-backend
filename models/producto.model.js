//Producto de Inventario/Catálogo (precio de VENTA); "activo" no está en Angular pero el backend ya lo mandaba
class Producto{
    constructor(idProducto,nombre,descripcion,precio,stock,imagenUrl,activo){
        this.idProducto=idProducto
        this.nombre=nombre
        this.descripcion=descripcion
        this.precio=precio
        this.stock=stock
        this.imagenUrl=imagenUrl
        this.activo=activo
    }
}
module.exports={Producto}