const express = require('express');
const pedidoController = require('../controllers/pedido.controller');
const {verificarToken,permitirRoles}=require('../middlewares/auth.middleware')
const router = express.Router();
// GET /api/pedidos-admin, esta manda TODOS los pedidos a un admin,
/*
Pero los manda ya con el proceso anterior de conversión o aplanación de la tabla al formato más cercano
a un JSON procesable
*/
router.get('/',verificarToken,permitirRoles('administrador'), (req, res) => {
    pedidoController.obtenerPedidosAdmin((error, pedidos) => {
        if (error) return res.status(error.status).json({ mensaje: error.mensaje });
        res.json(pedidos);
    });
});

// PATCH /api/pedidos-admin/:id/entregado , el body: recibe entregado: true|false,
// de esta forma permitimos que un solo endpoint haga el toggle, y no necesitamos 2 enpoints para esto
router.patch('/:id/entregado',verificarToken,permitirRoles('administrador'), (req, res) => {
    pedidoController.marcarEntregado(req.params.id, req.body.entregado, (error) => {
        if (error) return res.status(error.status).json({ mensaje: error.mensaje });
        res.json({ mensaje: 'Pedido actualizado' });
    });
});

// PATCH /api/pedidos-admin/:id/cancelado   body: { cancelado: true|false } (o sea lo mismo del comentario de arriba)
router.patch('/:id/cancelado',verificarToken,permitirRoles('administrador'), (req, res) => {
    pedidoController.marcarCancelado(req.params.id, req.body.cancelado, (error) => {
        if (error) return res.status(error.status).json({ mensaje: error.mensaje });
        res.json({ mensaje: 'Pedido actualizado' });
    });
});

module.exports = router;