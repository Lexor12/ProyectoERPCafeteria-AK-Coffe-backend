const express = require('express');
const router = express.Router();
const productoProveedorService = require('../services/productoProveedor.service');

// GET /api/proveedores/productos, devuelve TODOS los productos de TODOS los provedores y pues los proveedores, no devuelve solo los de un proveedor, sino TODOS
router.get('/productos', (req, res) => {
    productoProveedorService.obtenerProductosProveedor((error, productos) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al consultar los productos del proveedor' });
        }
        res.json(productos);
    });
});

// POST /api/proveedores/:idProveedor/productos  recibe  body: { idProducto, precioCompra } y permite asociar un producto ya existente con el precio del proveedor de ese producto a el proveedor (valga la redundancia)
router.post('/:idProveedor/productos', (req, res) => {
    const { idProducto, precioCompra } = req.body;
    productoProveedorService.asociarProductoProveedor(req.params.idProveedor, idProducto, precioCompra, (error) => {
        if (error) {
            if (error.duplicado) {//Este valor se devuelve desde nuestro service, si el error es porque ya existe el producto asociado a un proveedor, se notifica
                //Para asociar un producto ya existente a un provedor (digamos en caso de querer editar el precio), este debe de borrar y volver a crear
                return res.status(409).json({ mensaje: 'Este producto ya está asociado a este proveedor' });
            }
            return res.status(500).json({ mensaje: 'Error al asociar el producto al proveedor' });
        }
        res.json({ mensaje: 'Producto asociado al proveedor' });
    });
});

// DELETE /api/proveedores/:idProveedor/productos/:idProducto, aqui no se usa soft, ya que estas relaciones no poseen FK en otras tablas de sí mismas
router.delete('/:idProveedor/productos/:idProducto', (req, res) => {
    productoProveedorService.eliminarProductoProveedor(req.params.idProveedor, req.params.idProducto, (error, resultado) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al eliminar la asociación' });
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'No existe esa asociación producto-proveedor' });
        }
        res.json({ mensaje: 'Producto eliminado del catálogo del proveedor' });
    });
});

module.exports = router;