const express = require('express');
const router = express.Router();
const asistenciaService = require('../services/asistencia.service');

// GET /api/asistencias/:idTrabajador
router.get('/:idTrabajador', (req, res) => {
    asistenciaService.obtenerAsistencias(req.params.idTrabajador, (error, asistencias) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al consultar las asistencias' });
        }
        res.json(asistencias);
    });
});

// POST /api/asistencias   body: { idTrabajador, fecha, horaEntrada, horaSalida }
router.post('/', (req, res) => {
    const { idTrabajador, fecha, horaEntrada, horaSalida } = req.body;

    if (!idTrabajador || !fecha || !horaEntrada) {
        return res.status(400).json({ registrada: false, mensaje: 'Faltan datos de la asistencia' });
    }

    asistenciaService.registrarAsistencia(idTrabajador, fecha, horaEntrada, horaSalida, (error, resultado) => {
        if (error) {
            return res.status(500).json({ registrada: false, mensaje: 'Error al registrar la asistencia' });
        }
        res.json(resultado);
    });
});

module.exports = router;