const express = require('express');
const router = express.Router();
const pedidoClienteController = require('../controllers/pedido.controller');
const {verificarToken,permitirRoles}=require('../middlewares/auth.middleware')
// GET /api/pedidos-cliente/:idUsuario
/*
Aqui se pide un ID el cual se encuentra dentro del token que es mandado por el usuario
*/
router.get('/', verificarToken,permitirRoles('cliente'),(req, res) => {
    pedidoClienteController.obtenerPedidosCliente(req.usuario.idUsuario, (error, pedidos) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json(pedidos);
    });
});

module.exports = router;