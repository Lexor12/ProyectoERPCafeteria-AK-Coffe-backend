const express = require('express');
const router = express.Router();
const pedidoClienteService = require('../services/pedidoCliente.service');

// GET /api/pedidos-cliente/:idUsuario
/*
Aqui se pide un ID, pero cuando tenga lo de Auth se usará el token, ya que esto es básicamente
la vulnerabilidad más simple y negativa de mi sitio y sin duda alguna me pondria como dentro del top 5 
desarrolladores que hacen sistemas mas inseguros en caso de que esto lo despliegue fuera de producción
*/
router.get('/:idUsuario', (req, res) => {
    pedidoClienteService.obtenerPedidosCliente(req.params.idUsuario, (error, pedidos) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al consultar tus pedidos' });
        }
        res.json(pedidos);
    });
});

module.exports = router;