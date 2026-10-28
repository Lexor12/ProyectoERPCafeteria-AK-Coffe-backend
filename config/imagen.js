//config
//El service que devuelve los productos, retorna la url no completa, solo retorna la que es "local", que sirve para identificar el archivo dentro del directorio del backend, digamosle relativa
//Para hacer el cambio a una ruta conocida por el Backend, es necesario designar a cada ruta relativa el complemento que permitira obtenerla desde el frontend remoto
const DOMINIO_BACKEND='http://localhost:3200';//Este es el dominio y el puerto por defecto del Backend, si llegará yo a cambiar el puerto, simplemente actualizo este valor y evito tener que editar toda la base de datos

//Para permitir que el controller arme la ruta compelta, aqui creo esta funcion que las "une"
function unirUrlCompleta(rutaRelativa){
    if(!rutaRelativa){
        return `${DOMINIO_BACKEND}/uploads/sin_imagen.png`;//Esta ruta se aplica a cualquier producto que no tenga una imagen, de esta forma
        //muestran una imagen por defecto y se ve más atractivo para el cliente
    }
    return `${DOMINIO_BACKEND}/${rutaRelativa}`;//Aqui ya se arma completamente
}
module.exports={unirUrlCompleta,DOMINIO_BACKEND}