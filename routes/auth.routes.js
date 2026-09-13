const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');

// POST /api/auth/registro   body: { nombre, apellido, correo, password, telefono }
router.post('/registro', (req, res) => {
    const { nombre, apellido, correo, password, telefono } = req.body;

    // Validaciones mínimas de forma lo ideal es reforzar esto también en el front
    if (!nombre || !apellido || !correo || !password || !telefono) {
        return res.status(400).json({ creado: false, mensaje: 'Faltan campos obligatorios' });
    }

    authService.registrarUsuario({ nombre, apellido, correo, password, telefono }, (error) => {
        if (error) {
            if (error.correoDuplicado) {
                return res.status(409).json({ creado: false, mensaje: 'Ese correo ya está registrado' });
            }
            return res.status(500).json({ creado: false, mensaje: 'Error al registrar el usuario' });
        }
        res.json({ creado: true, mensaje: 'Usuario registrado correctamente' });
    });
});

// POST /api/auth/login   body: { correo, password }
router.post('/login', (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ autenticado: false, mensaje: 'Correo y contraseña son obligatorios' });
    }

    authService.iniciarSesion(correo, password, (error, resultado) => {
        if (error) {
            return res.status(500).json({ autenticado: false, mensaje: 'Error al iniciar sesión' });
        }
        // Si no fue autenticado, el resultado ya trae { autenticado: false }
        res.json(resultado);
    });
});

module.exports = router;