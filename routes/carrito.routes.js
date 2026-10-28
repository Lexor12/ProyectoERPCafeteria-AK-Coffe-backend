const express = require('express');
const router = express.Router();
const productoCarritoController = require('../controllers/carrito.controller');
const {verificarToken,permitirRoles}=require('../middlewares/auth.middleware')

// GET /api/carrito/productos, esta devuelve todos productos, para que el frontend los analice y arme el carrito con los valores actualizados
router.get('/productos',verificarToken,permitirRoles('administrador','cliente'), (req, res) => {
    productoCarritoController.obtenerProductosCarrito((error, productos) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json(productos);
    });
});

// POST /api/carrito/validar  recibe en body: { items: [{ idProducto, cantidad }] }
/*
Esta permite validar que los elementos que tengo guardados en carrito remoto estan actualizados
*/

router.post('/validar', verificarToken,permitirRoles('administrador','cliente'),(req, res) => {
    const items  = req.body;
    productoCarritoController.validarDisponibilidad(items, (error, resultado) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json(resultado);
    });
});

module.exports = router;