class ProductoCarrito {
    constructor(idProducto, nombre, descripcion, precio, stockDisponible, imagenUrl, cantidad) {
        this.idProducto = idProducto;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.stockDisponible = stockDisponible;
        this.imagenUrl = imagenUrl;
        this.cantidad = cantidad;
    }
}
module.exports = ProductoCarrito;