//Importo las librerias que usaré para los endpoints disponibles
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');
const {verificarToken,permitirRoles}=require('../middlewares/auth.middleware')
//Aqui se define los verbos HTTP que se pueden usar sobre el endpoint

// GET /api/productos
//Devuelve todos los productos activos
router.get('/', verificarToken, permitirRoles('administrador','cliente'), (req, res) => {
    productoController.obtenerProductos((error, productos) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json(productos);
    });
});


// POST /api/productos   body: { producto: { nombre, descripcion, costoUnitario } }
//Registrar un nuevo producto
router.post('/', verificarToken, permitirRoles('administrador'), (req, res) => {
    const { nombre,descripcion,costoUnitario } = req.body ?? {};
    productoController.registrarProducto(nombre, descripcion, costoUnitario, (error, respuesta) => {
        if (error) {
            return res.status(error.status).json({ registrada: false, mensaje: error.mensaje });
        }
        res.json(respuesta);
    });
});

// GET /api/productos/:id
//Obtener un producto en base a un id
router.get('/:id', verificarToken, permitirRoles('administrador','cliente'), (req, res) => {
    productoController.obtenerProductoPorId(req.params.id, (error, producto) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json(producto);
    });
});

// PUT /api/productos/:id
//Editar los campos de un producto
router.put('/:id', verificarToken, permitirRoles('administrador'), (req, res) => {
    const { nombre, descripcion, precio } = req.body;
    productoController.editarProducto(req.params.id, nombre, descripcion, precio, (error) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json({ mensaje: 'Producto actualizado' });
    });
});

// PATCH /api/productos/:id/desactivar
//desactivar (soft delete) a un producto
router.patch('/:id/desactivar', verificarToken, permitirRoles('administrador'), (req, res) => {
    productoController.desactivarProducto(req.params.id, (error) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json({ mensaje: 'Producto desactivado' });
    });
});

// POST /api/productos/:id/imagen   body: { imagen: "data:image/png;base64,...." }
//basicamente aqui nos encargamos de eliminar la imagen anterior, y permitimos reemplazarla con una nueva
router.post('/:id/imagen', verificarToken, permitirRoles('administrador'), (req, res) => {
    const { imagen } = req.body ?? {};
    productoController.subirImagen(req.params.id, imagen, (error, imagenUrl) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json({ mensaje: 'Imagen actualizada', imagenUrl });
    });
});

// DELETE /api/productos/:id/imagen, basicamente aqui nos encargamos de eliminar la imagen asociada a cierto producto
router.delete('/:id/imagen', verificarToken, permitirRoles('administrador'), (req, res) => {
    productoController.quitarImagen(req.params.id, (error) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        res.json({ mensaje: 'Imagen eliminada' });
    });
});

module.exports = router;
