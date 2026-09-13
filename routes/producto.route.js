//Importo las librerias que usaré para los endpoints disponibles
const express = require('express');
const router = express.Router();
const productoService = require('../services/producto.service');
const uploadConfig = require('../config/upload')

//Aqui se define los verbos HTTP que se pueden usar sobre el endpoint
router.get('/', (req, res) => {
    productoService.obtenerProductos(
        (error, productos) => {
            if (error) {
                return res.status(500).json({
                    mensaje: 'Error al consultar productos'
                });
            }
            res.json(productos);
        }
    );
});

// GET /api/productos/:id
router.get('/:id', (req, res) => {
    productoService.obtenerProductoPorId(req.params.id, (error, producto) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al consultar el producto' });
        }
        if (!producto) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
        res.json(producto);
    });
});

// PUT /api/productos/:id
router.put('/:id', (req, res) => {
    productoService.editarProducto(req.params.id, req.body, (error, resultado) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al editar el producto' });
        }
        res.json({ mensaje: 'Producto actualizado' });
    });
});

// PATCH /api/productos/:id/desactivar
router.patch('/:id/desactivar', (req, res) => {
    productoService.desactivarProducto(req.params.id, (error, resultado) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al desactivar el producto' });
        }
        res.json({ mensaje: 'Producto desactivado' });
    });
});

// POST /api/productos/:id/imagen   body: { imagen: "data:image/png;base64,...." }
router.post('/:id/imagen', (req, res) => {
    let datosImagen;
    try {
        datosImagen = uploadConfig.decodificarImagen(req.body.imagen);
    } catch (error) {
        return res.status(400).json({ mensaje: error.message });
    }

    productoService.obtenerImagenActual(req.params.id, (error, imagenAnterior) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al consultar el producto' });
        }

        uploadConfig.eliminarImagenArchivo(imagenAnterior); 
        const rutaImagen = uploadConfig.guardarImagen(req.params.id, datosImagen.buffer, datosImagen.extension);

        productoService.actualizarImagenProducto(req.params.id, rutaImagen, (error) => {
            if (error) {
                return res.status(500).json({ mensaje: 'Error al guardar la imagen' });
            }
            res.json({ mensaje: 'Imagen actualizada', imagenUrl: rutaImagen });
        });
    });
});

// DELETE /api/productos/:id/imagen
router.delete('/:id/imagen', (req, res) => {
    productoService.obtenerImagenActual(req.params.id, (error, imagenActual) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al consultar el producto' });
        }

        uploadConfig.eliminarImagenArchivo(imagenActual);

        productoService.quitarImagenProducto(req.params.id, (error) => {
            if (error) {
                return res.status(500).json({ mensaje: 'Error al eliminar la imagen' });
            }
            res.json({ mensaje: 'Imagen eliminada' });
        });
    });
});

module.exports = router;
