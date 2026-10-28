//const db = require('../config/db');
//Aquí no se requiere el uso de db, ya que las funciones reciben conexion, que basicamente es dada por la transaccion, para hacer todo en 1 misma, esto lo hace el controller

//Esta función permite insertar una compra como tal, asociandola con un proveedor, y llenandola con un total directamente
function insertarCompra(conexion, idCompra, idProveedor, total,callback){
    //Declaramos la sentencia que se manda a la base de datos
    const sentencia = `
        INSERT INTO Compra (id_compra, id_proveedor, fecha, total)
        VALUES (?, ?, NOW(), ?)
    `;
    conexion.query(sentencia,[idCompra, idProveedor, total],(error,resultado)=>{
        if(error){//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error,null);
            return
        }
        callback(null,resultado)
    })
}
//Esta función permite ya agregar todos esos productos comprados en una compra, actualmente las compras son directas entre proveedor y admin, pero se deja asi para seguir el formato que se tiene con venta
// y poder escalar en un futuro
function insertarDetalleCompra(conexion, idCompra, idProducto, cantidad, costoUnitario,callback){
    //Declaramos la sentencia que se manda a la base de datos
    const sentenciaDetalle = `
        INSERT INTO Detalle_Compra (id_compra, id_producto, cantidad, costo_unitario)
        VALUES (?, ?, ?, ?)
    `;
    conexion.query(sentenciaDetalle, [idCompra, idProducto, cantidad, costoUnitario], (error,resultado) => {
        if (error) {//Si al intentar ejecutar la sentencia en la base de datos nos retorna un error, significa que algo esta mal por lo que enviamos de regreso el error
            callback(error, null);
            return;
        }
        callback(null,resultado)
    })
}

module.exports = {
    insertarCompra,
    insertarDetalleCompra,
};