// producto.model.js
// Este modelo solo documenta la forma que debe tener un Producto en las respuestas del backend,
// coincide exactamente con la interfaz Producto que ya usas en Angular
class Producto {
    constructor(idProducto, nombre, descripcion, precio, stock, imagenUrl, activo) {
        this.idProducto = idProducto;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.stock = stock;
        this.imagenUrl = imagenUrl;
        this.activo = activo;
    }
}
module.exports = Producto;