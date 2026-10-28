const express = require('express');
const router = express.Router();
const proveedorController=require('../controllers/proveedor.controller')
const {verificarToken,permitirRoles}=require('../middlewares/auth.middleware')

// GET /api/proveedores/productos, devuelve TODOS los productos de TODOS los provedores y pues los proveedores, no devuelve solo los de un proveedor, sino TODOS
router.get('/productos',verificarToken,permitirRoles('administrador'), (req, res) => {
    proveedorController.obtenerProductosProveedor((error, productos) => {
        if (error) return res.status(error.status).json({ mensaje: error.mensaje });
        res.json(productos);
    });
});

// POST /api/proveedores/:idProveedor/productos  recibe  body: { idProducto, precioCompra } y permite asociar un producto ya existente con el precio del proveedor de ese producto a el proveedor (valga la redundancia)
router.post('/:idProveedor/productos',verificarToken,permitirRoles('administrador'), (req, res) => {
    const { idProducto, precioCompra } = req.body;
    proveedorController.asociarProductoProveedor(req.params.idProveedor, idProducto, precioCompra, (error) => {
        if (error) return res.status(error.status).json({ mensaje: error.mensaje });
        res.json({ mensaje: 'Producto asociado al proveedor' });
    });
});

// PATCH /api/proveedores/:idProductoProveedor  para editar un producto de un proveedor
router.patch('/:idProductoProveedor',verificarToken,permitirRoles('administrador'), (req, res) => {
    const { idProductoProveedor } = req.params;
    const { nombre, descripcion, precioUnitario } = req.body;
    proveedorController.editarProductoProveedor(idProductoProveedor, nombre, descripcion, precioUnitario, (error) => {
        if (error) return res.status(error.status).json({ mensaje: error.mensaje });
        res.json({ mensaje: 'Producto actualizado' });
    });
});

// DELETE /api/proveedores/:idProveedor/productos/:idProducto, aqui no se usa soft, ya que estas relaciones no poseen FK en otras tablas de sí mismas
router.delete('/:idProveedor/productos/:idProducto',verificarToken,permitirRoles('administrador'), (req, res) => {
    proveedorController.eliminarProductoProveedor(req.params.idProveedor, req.params.idProducto, (error) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json({ mensaje: 'Producto eliminado del catálogo del proveedor' });
    });
});

module.exports = router;