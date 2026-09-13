const express = require('express');
const router = express.Router();
const proveedorService = require('../services/proveedor.service');

// GET /api/proveedores, devuelve todos los proveedores
router.get('/', (req, res) => {
    proveedorService.obtenerProveedores((error, proveedores) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al consultar proveedores' });
        }
        res.json(proveedores);
    });
});

// POST /api/proveedores   body: { nombre, telefono }, crea un proveedor
router.post('/', (req, res) => {
    const { nombre, telefono } = req.body;
    if (!nombre || !telefono) {
        return res.status(400).json({ mensaje: 'Faltan datos del proveedor' });
    }
    proveedorService.crearProveedor(nombre, telefono, (error) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al registrar el proveedor' });
        }
        res.json({ mensaje: 'Proveedor registrado' });
    });
});


module.exports = router;