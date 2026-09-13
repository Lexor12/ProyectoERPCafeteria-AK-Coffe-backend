const express = require('express');
const router = express.Router();
const nominaService = require('../services/nomina.service');

// GET /api/nomina/:idTrabajador?fechaInicio=2026-01-01&fechaFin=2026-01-31
router.get('/:idTrabajador', (req, res) => {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
        return res.status(400).json({ mensaje: 'Se requiere fechaInicio y fechaFin' });
    }
    // RQNF70: la fecha de inicio no debe ser posterior a la de fin
    if (new Date(fechaInicio) > new Date(fechaFin)) {
        return res.status(400).json({ mensaje: 'fechaInicio no puede ser posterior a fechaFin' });
    }

    nominaService.calcularNomina(req.params.idTrabajador, fechaInicio, fechaFin, (error, resultado) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al calcular la nómina' });
        }
        if (!resultado) {
            return res.status(404).json({ mensaje: 'Trabajador no encontrado' });
        }
        res.json(resultado);
    });
});

module.exports = router;