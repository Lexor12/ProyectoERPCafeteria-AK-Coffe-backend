const express = require('express');
const router = express.Router();
const rhController=require('../controllers/rh.controller')
const {verificarToken,permitirRoles}=require('../middlewares/auth.middleware')

// GET /api/trabajadores, devuelve a todos los trabajadores
router.get('/',verificarToken,permitirRoles('administrador'), (req, res) => {
    rhController.obtenerTrabajadores((error, trabajadores) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al consultar trabajadores' });
        }
        res.json(trabajadores);
    });
});

// POST /api/trabajadores
router.post('/',verificarToken,permitirRoles('administrador'), (req, res) => {
    const { nombre, apellido, area, rfc,fechaIngreso, salario, horaEntrada, horaSalida } = req.body;
    rhController.registrarTrabajador(nombre, apellido, area, rfc,fechaIngreso, salario, horaEntrada, horaSalida, (error) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json({ mensaje: 'Trabajador registrado' });
    });
});

// PUT /api/trabajadores/:id
router.put('/:id', verificarToken,permitirRoles('administrador'),(req, res) => {
    const { nombre, apellido, area, rfc, salario, horaEntrada, horaSalida } = req.body;
    rhController.editarTrabajador(req.params.id, nombre, apellido, area, rfc, salario, horaEntrada, horaSalida, (error) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json({ mensaje: 'Trabajador actualizado' });
    });
});

// PATCH /api/trabajadores/:id/activo   body: { activo: true|false }
router.patch('/:id/activo',verificarToken,permitirRoles('administrador'), (req, res) => {
    rhController.cambiarActivoTrabajador(req.params.id, req.body.activo, (error) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json({ mensaje: 'Trabajador actualizado' });
    });
});

module.exports = router;