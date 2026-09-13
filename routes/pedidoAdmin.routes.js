const express = require('express');
const pedidoAdminService = require('../services/pedidoAdmin.service');

const router = express.Router();

// GET /api/pedidos-admin, esta manda TODOS los pedidos a un admin,
/*
Pero los manda ya con el proceso anterior de conversión o aplanación de la tabla al formato más cercano
a un JSON procesable
*/
router.get('/', (req, res) => {
    pedidoAdminService.obtenerPedidosAdmin((error, pedidos) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al consultar los pedidos' });
        }
        res.json(pedidos);
    });
});

// PATCH /api/pedidos-admin/:id/entregado , el body: recibe entregado: true|false,
// de esta forma permitimos que un solo endpoint haga el toggle, y no necesitamos 2 enpoints para esto
router.patch('/:id/entregado', (req, res) => {
    pedidoAdminService.marcarEntregado(req.params.id, req.body.entregado, (error) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al actualizar el pedido' });
        }
        res.json({ mensaje: 'Pedido actualizado' });
    });
});

// PATCH /api/pedidos-admin/:id/cancelado   body: { cancelado: true|false } (o sea lo mismo del comentario de arriba)
router.patch('/:id/cancelado', (req, res) => {
    pedidoAdminService.marcarCancelado(req.params.id, req.body.cancelado, (error) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al actualizar el pedido' });
        }
        res.json({ mensaje: 'Pedido actualizado' });
    });
});

module.exports = router;