const express = require('express');
const router = express.Router();
const rhController=require('../controllers/rh.controller')
const {verificarToken,permitirRoles}=require('../middlewares/auth.middleware')
// GET /api/nomina/:idTrabajador?fechaInicio=2026-01-01&fechaFin=2026-01-31
router.get('/:idTrabajador',verificarToken,permitirRoles('administrador'), (req, res) => {
    const { fechaInicio, fechaFin } = req.query;
    rhController.calcularNomina(req.params.idTrabajador, fechaInicio, fechaFin, (error, resultado) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json(resultado);
    });
});

module.exports = router;