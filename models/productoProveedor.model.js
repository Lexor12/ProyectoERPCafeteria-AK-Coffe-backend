//Producto asociado a un proveedor (aquí el precio es de COMPRA)
class ProductoProveedor{
    constructor({idProductoProveedor,idProducto,nombre,descripcion,precio,idProveedor,imagenUrl}){
        this.idProductoProveedor=idProductoProveedor
        this.idProducto=idProducto
        this.nombre=nombre
        this.descripcion=descripcion
        this.precio=precio
        this.idProveedor=idProveedor
        this.imagenUrl=imagenUrl
    }
}
module.exports={ProductoProveedor}