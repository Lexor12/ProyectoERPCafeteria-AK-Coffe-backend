const express = require('express');
const router = express.Router();
const proveedorController=require('../controllers/proveedor.controller')
const {verificarToken,permitirRoles}=require('../middlewares/auth.middleware')
// GET /api/proveedores, devuelve todos los proveedores
router.get('/', verificarToken,permitirRoles('administrador'),(req, res) => {
    proveedorController.obtenerProveedores((error, proveedores) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json(proveedores);
    });
});

// POST /api/proveedores   body: { nombre, telefono }, crea un proveedor
router.post('/',verificarToken,permitirRoles('administrador'), (req, res) => {
    const { nombre, telefono } = req.body;
    proveedorController.registrarProveedor(nombre, telefono, (error) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json({ mensaje: 'Proveedor registrado' });
    });
});

// POST /api/proveedores/:idProveedor   body: { nombre, telefono }, edita un proveedor existente
router.put('/:idProveedor',verificarToken,permitirRoles('administrador'), (req, res) => {
    const {idProveedor}=req.params
    const { nombre, telefono } = req.body;
    proveedorController.editarProveedor(idProveedor, nombre, telefono, (error) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json({ mensaje: 'Proveedor actualizado' });
    });
});

// DELETE /api/proveedores/:idProveedor desactiva un proveedor existente
router.delete('/:idProveedor',verificarToken,permitirRoles('administrador'), (req, res) => {
    const { idProveedor } = req.params;

    proveedorController.desactivarProveedor(idProveedor, (error) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json({ mensaje: 'Proveedor desactivado' });
    });
});

module.exports = router;