const express = require('express');
const router = express.Router();
const trabajadorService = require('../services/trabajador.service');

// GET /api/trabajadores, devuelve a todos los trabajadores
router.get('/', (req, res) => {
    trabajadorService.obtenerTrabajadores((error, trabajadores) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al consultar trabajadores' });
        }
        res.json(trabajadores);
    });
});

// POST /api/trabajadores
router.post('/', (req, res) => {
    trabajadorService.crearTrabajador(req.body, (error) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al registrar el trabajador' });
        }
        res.json({ mensaje: 'Trabajador registrado' });
    });
});

// PUT /api/trabajadores/:id
router.put('/:id', (req, res) => {
    trabajadorService.editarTrabajador(req.params.id, req.body, (error) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al editar el trabajador' });
        }
        res.json({ mensaje: 'Trabajador actualizado' });
    });
});

// PATCH /api/trabajadores/:id/activo   body: { activo: true|false }
router.patch('/:id/activo', (req, res) => {
    trabajadorService.cambiarActivoTrabajador(req.params.id, req.body.activo, (error) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al actualizar el trabajador' });
        }
        res.json({ mensaje: 'Trabajador actualizado' });
    });
});

module.exports = router;