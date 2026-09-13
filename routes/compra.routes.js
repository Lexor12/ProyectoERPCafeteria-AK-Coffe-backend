const express = require('express');
const router = express.Router();
const compraService = require('../services/compra.service');

// POST /api/compras/existente   recibe en body: { idProveedor, idProducto, cantidad, costoUnitario }
// Esto es el botón "Surtir" de un producto que ya está en el catálogo del proveedor
router.post('/existente', (req, res) => {
    const { idProveedor, idProducto, cantidad, costoUnitario } = req.body;

    if (!idProveedor || !idProducto || !cantidad || !costoUnitario) {
        return res.status(400).json({ registrada: false, mensaje: 'Faltan datos de la compra' });
    }

    compraService.registrarCompraProductoExistente(idProveedor, idProducto, cantidad, costoUnitario, (error, resultado) => {
        if (error) {
            return res.status(500).json({ registrada: false, mensaje: 'Error al registrar la compra' });
        }
        res.json(resultado);
    });
});

// POST /api/compras/nuevo  recibe en body: { idProveedor, producto: { nombre, descripcion, precioVenta }, cantidad, costoUnitario }
// Esto es cuando el producto no existía todavía, se crea desde cero, aqui ocurre multiples procesos, como agregar producto, asociar a proveedor, hacer "compra", checar stock y eso
router.post('/nuevo', (req, res) => {
    const { idProveedor, producto, costoUnitario } = req.body;

    if (!idProveedor || !producto || !producto.nombre || !costoUnitario) {
        return res.status(400).json({ registrada: false, mensaje: 'Faltan datos del producto o la compra' });
    }

    compraService.registrarCompraProductoNuevo(idProveedor, producto, costoUnitario, (error, resultado) => {
        if (error) {
            return res.status(500).json({ registrada: false, mensaje: 'Error al registrar la compra' });
        }
        res.json(resultado);
    });
});

module.exports = router;