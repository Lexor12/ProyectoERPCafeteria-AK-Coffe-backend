const express = require('express');
const router = express.Router();
const rhController=require('../controllers/rh.controller')
const {verificarToken,permitirRoles}=require('../middlewares/auth.middleware')

// GET /api/asistencias/:idTrabajador
router.get('/:idTrabajador',verificarToken,permitirRoles('administrador'), (req, res) => {
    rhController.obtenerAsistencias(req.params.idTrabajador, (error, asistencias) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json(asistencias);
    });
});

// POST /api/asistencias   body: { idTrabajador, fecha, horaEntrada, horaSalida }
router.post('/',verificarToken,permitirRoles('administrador'),(req, res) => {
    const { idTrabajador, fecha, horaEntrada, horaSalida } = req.body;
    rhController.registrarAsistencia(idTrabajador, fecha, horaEntrada, horaSalida, (error, resultado) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json(resultado);
    });
});

module.exports = router;