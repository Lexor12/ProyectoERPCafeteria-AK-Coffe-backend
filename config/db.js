const mysql = require('mysql2')

// createPool en vez de createConnection: esto crea un grupo de conexiones reutilizables
// en vez de una sola línea fija, esto es necesario para poder usar transacciones
const conexion = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ak_coffe',
    connectionLimit: 10 // Como máximo solo podemos tener 10 conexiones en la pool
})

// A diferencia de createConnection, el pool no se "conecta" de un jalón al arrancar,
// va abriendo conexiones conforme se necesitan. Esto es solo para probar que sí hay
// conexión válida a la BD desde que arranca el server
conexion.getConnection((error, conexionDePrueba) => {
    if (error) {
        console.error('Error de conexión', error)
        return
    }
    console.log('Conexión a MySQL correcta')
    conexionDePrueba.release() // la regresamos al pool, ya cumplió su propósito de prueba
})

module.exports = conexion