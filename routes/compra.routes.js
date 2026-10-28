const express = require('express');
const router = express.Router();
const compraController=require('../controllers/compra.controller')
const {verificarToken,permitirRoles}=require('../middlewares/auth.middleware')
// POST /api/compras/existente   recibe en body: { idProveedor, idProducto, cantidad, costoUnitario }
// Esto es el botón "Surtir" de un producto que ya está en el catálogo del proveedor
router.post('/existente',verificarToken,permitirRoles('administrador'), (req, res) => {
    const { idProveedor, idProducto, cantidad } = req.body;
    
    compraController.registrarCompraSurtirProducto(idProveedor, idProducto, cantidad, (error, resultado) => {
        if (error) return res.status(error.status).json({ mensaje: error.mensaje });
        res.json(resultado);
    });
});

// POST /api/compras/nuevo  recibe en body: { idProveedor, producto: { nombre, descripcion, precioVenta }, cantidad, costoUnitario }
// Esto es cuando el producto no existía todavía, se crea desde cero, aqui ocurre multiples procesos, como agregar producto, asociar a proveedor, hacer "compra", checar stock y eso
router.post('/nuevo',verificarToken,permitirRoles('administrador'), (req, res) => {
    const { idProveedor, producto, costoUnitario } = req.body;

    compraController.registrarCompraProductoNuevo(idProveedor, producto?.nombre, producto?.descripcion, costoUnitario, (error, resultado) => {
        if (error) return res.status(error.status).json({ mensaje: error.mensaje });
        res.json(resultado);
    });
});

module.exports = router;