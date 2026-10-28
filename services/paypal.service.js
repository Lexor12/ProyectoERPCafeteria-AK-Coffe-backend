//El service solo se comunica con la API de PayPal, las reglas de la compra las decide el controller
const BASE_URL = process.env.PAYPAL_BASE_URL

async function obtenerToken() {
    //Aqui declaramos las credenciales que usaremos, estas son del Sandbox
    const clientID=process.env.PAYPAL_CLIENT_ID
    const secret=process.env.PAYPAL_CLIENT_SECRET//Estas son las claves que nos identifican como clientes, nosotros nos identificamos como clientes con PayPal (o sea como el negocio)
    //Las respuestas debemos acomodarlas dentro del cuerpo de la peticion en un formato adecuado
    const credenciales=Buffer.from(`${clientID}:${secret}`).toString('base64')//Convertimos en base64 para que pueda ser procesada por PayPal
    const respuesta=await fetch(`${BASE_URL}/v1/oauth2/token`,{
        method:'POST',
        headers:{
            'Authorization':`Basic ${credenciales}`,
            'Content-Type':'application/x-www-form-urlencoded'
        },
        body:'grant_type=client_credentials'
    })//Verificamos y procesamos la solicitud
    const datos=await respuesta.json();
    if(!respuesta.ok){//Si nos da error notificamos
        throw new Error("Error de autenticacion con PayPal");
    }
    return datos.access_token;//Se requiere un token de acceso para tener un acceso temporal y no estar mandando en cada solicitud un usuario y contraseña
}
//Enviar peticiones a paypal
async function paypalRequest(ruta,metodo,body) {//La ruta, el metodo y el objeto de los datos de la orden
    const token=await obtenerToken();
    const respuesta=await fetch(`${BASE_URL}${ruta}`,
        {
            method:metodo,
            headers:{
                'Authorization':`Bearer ${token}`,
                'Content-Type':'application/json'
            },
            ...(body!==undefined?{body:JSON.stringify(body)}:{})//Si existe informacion en el body enviamos la informacion adjunta al cuerpo, en caso de que no, pues no enviamos nada
            //Este operador es un ternario y un condicional, si no tenemos nada en el cuerpo pues no hacemos nada
            //El parametro body es opcional, algunas peticiones requieren enviar un cuerpo o no, nosotros comprobamos indefinido
            //Usamos unedefined, pq al usar null pues en teoria si tiene un tipo de dato, y con unedefined es cuando directamente no se considera (cuando ni siquiera al llamar a la funcion usamos null) 
            /*
            La principal diferencia es que undefined significa que una variable fue declarada pero no tiene un valor asignado (lo hace JavaScript de forma automática), 
            mientras que null es un valor vacío que tú asignas a propósito para indicar que algo no tiene valor.
            */
        }
    )
    const datos=await respuesta.json();
    if(!respuesta.ok){//Aquí si recibimos un error, no sería de Authenticacion, sino, de que los datos de la operación fueron rechazados (con esto nosotros decimos que el usuario que hizo una compra tuvo un problema)
        console.error('Error de PayPal: ',datos);
        throw new Error('Operacion de PayPal rechazada');
    }
    return datos   
}
//Ahora, para desprender al controller de tener que llamar a paypalRequest y mandar un conjunto de parametros fijos ya conocidos
// yo agrego estas funciones para facilitar las llamadas
function crearOrden(datosOrden) {//Esta simplemente hace el post, los datos los sigue mandando el controller, pero ya no la ruta ni el metodo
    return paypalRequest('/v2/checkout/orders', 'POST', datosOrden)
}
function capturarOrden(orderID) {//Permite capturar una compra o sea efectuarla después de que ya fue pagada
    return paypalRequest(`/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`, 'POST', {})
}
function reembolsarCaptura(idCaptura) {
    return paypalRequest(`/v2/payments/captures/${encodeURIComponent(idCaptura)}/refund`, 'POST', {})
}
module.exports = { crearOrden, capturarOrden,reembolsarCaptura }