const express = require('express');
const router = express.Router();
const reporteFinanzaService = require('../services/reporteFinanza.service');

//ACLARACIÓN: UN GET NO RECIBE BODY, AUNQUE hace poco salio un verbo nuevo que es un get con body, pero idealmente solo Query Params
// GET /api/finanzas/reporte?fechaInicio=2026-01-01&fechaFin=2026-09-01
router.get('/reporte', (req, res) => {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
        return res.status(400).json({ mensaje: 'Se requiere fechaInicio y fechaFin' });
    }
    // RQNF52: fechaInicio no debe ser posterior a fechaFin
    if (new Date(fechaInicio) > new Date(fechaFin)) {
        return res.status(400).json({ mensaje: 'fechaInicio no puede ser posterior a fechaFin' });
    }

    reporteFinanzaService.obtenerReporteFinanza(fechaInicio, fechaFin, (error, reporte) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al generar el reporte' });
        }
        res.json(reporte);
    });
});

module.exports = router;