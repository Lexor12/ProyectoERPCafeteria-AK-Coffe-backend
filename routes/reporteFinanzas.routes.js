const express = require('express');
const router = express.Router();
const reporteFinanzaController = require('../controllers/finanzas.controller');
const {verificarToken,permitirRoles}=require('../middlewares/auth.middleware')
//ACLARACIÓN: UN GET NO RECIBE BODY, AUNQUE hace poco salio un verbo nuevo que es un get con body, pero idealmente solo Query Params
// GET /api/finanzas/reporte?fechaInicio=2026-01-01&fechaFin=2026-09-01
router.get('/reporte', verificarToken,permitirRoles('administrador'),(req, res) => {
    const { fechaInicio, fechaFin } = req.query;
    reporteFinanzaController.obtenerReporteFinanza(fechaInicio, fechaFin, (error, reporte) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json(reporte);
    });
});

module.exports = router;