const db = require('../config/db');
const {Proveedor} = require('../models/proveedor.model')

// Trae los proveedores activos, esto llena el <select> del filtro y también
// se usa en el modal de "Agregar Producto" para elegir a qué proveedor asociarlo
function obtenerProveedores(callback) {
    const sentencia = `
        SELECT
            id_proveedor AS idProveedor,
            nombre,
            telefono,
            activo
        FROM Proveedor
        WHERE activo = TRUE
    `;
    db.query(sentencia, (error, resultados) => {
        if (error) {
            callback(error, null);
            return;
        }
        const proveedores=resultados.map(elemento=>new Proveedor(
            elemento.idProveedor,elemento.nombre,elemento.telefono,elemento.activo
        ))
        callback(null, proveedores);
    });
}

//Trae un proveedor en especifico usando una conexion, este se utiliza por el controller de compra
function obtenerProveedorPorId(conexion,idProveedor,callback) {
    const sentencia = `
        SELECT
            id_proveedor AS idProveedor,
            nombre,
            telefono,
            activo
        FROM Proveedor
        WHERE activo = TRUE AND id_proveedor = ?
    `;
    conexion.query(sentencia,[idProveedor], (error, resultados) => {
        if (error) {
            callback(error, null);
            return;
        }
        const resultado=resultados[0];
        if(!resultado){ callback(null, null); return; }
        callback(null, new Proveedor(
            resultado.idProveedor,resultado.nombre,resultado.telefono,resultado.activo
        ));
    });
}

// Registra un nuevo proveedor
function crearProveedor(nombre, telefono, callback) {
    const sentencia = 'INSERT INTO Proveedor (nombre, telefono) VALUES (?, ?)';
    db.query(sentencia, [nombre, telefono], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

// Edita un nuevo proveedor existente
function editarProveedor(idProveedor,nombre, telefono, callback) {
    const sentencia = 'UPDATE Proveedor SET nombre=?,telefono=? WHERE id_proveedor=?';
    db.query(sentencia, [nombre, telefono,idProveedor], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

// desactiva y elimina los Catalogo Proveedor de un  nuevo proveedor 
function desactivarProveedor(conexion, idProveedor, callback) {
    const sentencia = 'UPDATE Proveedor SET activo = FALSE WHERE id_proveedor = ?';
    conexion.query(sentencia, [idProveedor], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

module.exports = {
    obtenerProveedores,
    crearProveedor,
    editarProveedor,
    desactivarProveedor,
    obtenerProveedorPorId
};