//La ruta solo recibe la petición, arma el model, llama al controller y responde; la lógica vive en el controller
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { RespuestaRegistro } = require('../models/respuestaRegistro.model');

// POST /api/auth/registro   
//Aqui se recibe la petición para registrar un nuevo usuario, recibimos los datos siguientes:
//body: { nombre, apellido, correo, password, telefono,confirmacionTerminosYCondiciones }
router.post('/registro', (req, res) => {
    const { nombre, apellido, correo, password, telefono,confirmacionTerminosYCondiciones } = req.body;
    authController.registro(nombre,apellido,correo,password,telefono,confirmacionTerminosYCondiciones, (error, respuesta) => {
        if (error) {
            return res.status(error.status).json(new RespuestaRegistro(false, error.mensaje));
        }
        res.status(201).json(respuesta);
    });
});

// POST /api/auth/login   
//En este endpoint permitimos el iniciar sesión, aquí recibimos un correo y contraseña enviados y los comprobamos
//si todo sale bien y las credenciales son validas retornamos el token y datos del usuario
//body: { correo, password }
router.post('/login', (req, res) => {
    const { correo, password } = req.body;
    authController.login(correo, password, (error, respuesta) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json(respuesta);
    });
});

module.exports = router;