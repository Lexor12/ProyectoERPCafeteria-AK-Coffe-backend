const express = require('express');
const router = express.Router();
const validadores = require('../config/validadores');
const {verificarToken,permitirRoles}=require('../middlewares/auth.middleware')
const ventaController=require('../controllers/venta.controller')
// POST /api/ventas/paypal/crear -> Inicia la orden en PayPal calculando el total real
router.post('/paypal/crear', verificarToken, permitirRoles('cliente'), function(req, res) {
    const { rfcCliente,confirmacionTerminosYCondiciones, items } = req.body;
    const idUsuario = req.usuario.idUsuario;
    //Debe ser exactamente true: un texto o un número no cuentan como aceptación
    if(!confirmacionTerminosYCondiciones || confirmacionTerminosYCondiciones!==true){//Si no acepta los terminos estariamos en problemas legales
        return res.status(400).json({mensaje:'El sistema exige que los Términos y Condiciones sean leidos y aceptados'})
    }
    if (!validadores.esUuidValido(idUsuario)) {//Validamos el UUID, para evitar consultas a endpoints con formatos no correctos
        return res.status(400).json({ mensaje: 'El id del usuario no es válido' });
    }
    if(!items || items.length<1){
        return res.status(400).json({ mensaje: 'No hay elementos para la compra' });
    }

    ventaController.iniciarPagoPayPal(idUsuario, rfcCliente, confirmacionTerminosYCondiciones,items, (error, respuesta) => {
        if (error) {
            return res.status(error.status).json({ iniciado: false, mensaje: error.mensaje });
        }
        res.json(respuesta);
    });
});

// POST /api/ventas/paypal/capturar -> Captura el dinero y guarda la venta en BD
router.post('/paypal/capturar', verificarToken, permitirRoles('cliente'), function(req, res) {
    const { orderID, rfcCliente, items } = req.body;
    const idUsuario = req.usuario.idUsuario;
    if (!validadores.esUuidValido(idUsuario)) {//Validamos el UUID, para evitar consultas a endpoints con formatos no correctos
        return res.status(400).json({ mensaje: 'El id del usuario no es válido' });
    }
    ventaController.capturarPagoPayPal(orderID, idUsuario, rfcCliente, items, (error, respuesta) => {
        if (error) {
            return res.status(error.status).json({ registrada: false, mensaje: error.mensaje });
        }
        res.json(respuesta);
    });
});
module.exports = router;