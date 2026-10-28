//Para muchos procesos del Backend, yo utilizo la "conexion1, o una transaccion", por ejemplo para ventas, compras, etc, aqui es fundamental
//usar las transacciones para hacer un todo o nada, para garantizar que una venta no solo se quede a medias
//Este service proporciona ese servicio a la base de datos para usar y gestionar las transacciones, de aqui controllers dependen para utilizar otros services
const db = require('../config/db')

//Aqui pedimos a la Base de datos, una conexion didicada del pool y abrimos una transaccion, de aqui todas las demas consultas van a colgarse, y si una no funciona, alerta para que ninguna proceda
function iniciarTransaccion(callback){
    //Solicitamos la conexion al servicio de mysql
    db.getConnection((error,conexion)=>{
        if(error){
            callback(error,null);//Si tenemos un error al obtener la conexion, hay que retornarlo directamente 
            return;
        }
        conexion.beginTransaction((error)=>{
            if(error){
                conexion.release();//Si algo falla regresamos la conexion
                callback(error,null);
                return;
            }
            callback(null,conexion);//Si todo sale bien, retornamos la conexion para que sea usada por otros 
        })
    })
}
// Confirma los cambios de verdad y regresa la conexión al pool
function confirmarTransaccion(conexion, callback) {
    conexion.commit((error) => {
        conexion.release();
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, true);
    });
}

// Deshace todo lo hecho en la transacción y regresa la conexión al pool
function cancelarTransaccion(conexion) {
    conexion.rollback(() => conexion.release());
}

module.exports = {
    iniciarTransaccion,
    confirmarTransaccion,
    cancelarTransaccion,
};