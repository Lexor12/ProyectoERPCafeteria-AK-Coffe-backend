const express = require('express');
const router = express.Router();
const ventaService = require('../services/venta.service');

// POST /api/ventas , recibe en body: { idUsuario, rfcCliente, items: [{ idProducto, cantidad }] }
// Esto se llama después de que PayPal confirma el pago, pero como de momento no tenemos
// el servcio de papyal simplemente efectuamos esta sentencia desde el frontend
router.post('/', (req, res) => {
    const { idUsuario, rfcCliente, items } = req.body;//ACLARACIÓN, el idUsuario, 
    //tambien será obtenido en un futuro con el token, no asi por body, eso sería un aspecto MUY negativo

    if (!idUsuario || !items) {
        return res.status(400).json({ registrada: false, mensaje: 'Faltan datos de la venta' });
    }

    ventaService.registrarVenta(idUsuario, rfcCliente, items, (error, resultado) => {
        if (error) {
            return res.status(500).json({ registrada: false, mensaje: 'Error al registrar la venta' });
        }
        res.json(resultado);
    });
});

module.exports = router;