const express = require('express');
const router = express.Router();
const productoCarritoService = require('../services/productoCarrito.service');

// GET /api/carrito/productos, esta devuelve todos productos, para que el frontend los analice y arme el carrito con los valores actualizados
router.get('/productos', (req, res) => {
    productoCarritoService.obtenerProductosCarrito((error, productos) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al consultar el catálogo' });
        }
        res.json(productos);
    });
});

// POST /api/carrito/validar  recibe en body: { items: [{ idProducto, cantidad }] }
/*
Esta permite validar que los elementos que tengo guardados en carrito remoto estan actualizados
*/
router.post('/validar', (req, res) => {
    productoCarritoService.validarDisponibilidad(req.body.items, (error, resultado) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al validar el carrito' });
        }
        res.json(resultado);
    });
});

module.exports = router;