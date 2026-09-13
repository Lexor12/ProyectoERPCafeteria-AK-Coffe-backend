const db = require('../config/db');

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
        callback(null, resultados);
    });
}

// Registra un nuevo proveedor (RQF20)
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

module.exports = {
    obtenerProveedores,
    crearProveedor,
};