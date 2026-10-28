//El controller aplica las reglas de la compra: valida, calcula el total real, verifica el pago con PayPal y registra la venta
const crypto = require('crypto');
const { promisify } = require('util');
const ventaService = require('../services/venta.service');
const paypalService = require('../services/paypal.service');
const transaccionService = require('../services/transaccion.service');
const validadores = require('../config/validadores');
const productoService=require('../services/producto.service')
const { ErrorApp } = require('../models/errorApp.model');
const { ItemCarrito } = require('../models/itemCarrito.model');
const { ItemVenta } = require('../models/itemVenta.model');
const { ResumenVenta } = require('../models/resumenVenta.model');
const { RespuestaPago } = require('../models/respuestaPago.model');
const { RespuestaVenta } = require('../models/respuestaVenta.model');
const facturaController =require('../controllers/factura.controller')


//Los definí aquí pq  los estaba cambie y cambie JAJAJAJA
//Rutas del frontend a las que PayPal regresa al cliente
const URL_RETORNO = 'http://localhost:4200/tienda/pago-exitoso';
const URL_CANCELACION = 'http://localhost:4200/tienda/pago-rechazado';

// El dinero se calcula en centavos (números enteros) para evitar errores de decimales de JavaScript
function aCentavos(monto) {//Esta función convierte de pesos a centavos
    return Math.round(Number(monto) * 100);
}

function aMonto(centavos) {//Esta función convierte de centavos a pesos
    return centavos / 100;
}
// Valida lo que manda el cliente: carrito con productos válidos y RFC opcional bien formado
function validarCompra(rfcCliente, items) {
    //Primero validamos que se este mandando una lista de elementos, y que no este vacia
    if (!Array.isArray(items) || items.length === 0) {
        return new ErrorApp(400, 'El carrito está vacío');
    }
    for (const item of items) {//Validamos que cada elemento (producto), realmente este mandando un UUID y cantidad valida
        if (!item || !validadores.esUuidValido(item.idProducto)) {
            return new ErrorApp(400, 'Hay un producto con id inválido en el carrito');
        }
        if (!validadores.esEnteroPositivoValido(item.cantidad)) {
            return new ErrorApp(400, 'La cantidad de cada producto debe ser un entero mayor a 0');
        }
    }
    //El RFC es opcional, asi que si se manda un RFC comprobamos que no este mal (por defecto es unedefined)
    if (rfcCliente && !validadores.esRfcValido(rfcCliente)) {
        return new ErrorApp(400, 'El RFC debe tener entre 12 y 13 caracteres alfanuméricos');
        //Aqui y en toda la función mandamos el return new ErrorApp, ya que quien implemente esta función espera este objeto de error para mandarlo
    }
    return null;
}
// Si el mismo producto viene dos veces en el carrito, se suman sus cantidades en un solo ItemCarrito
function unificarItems(items) {
    const cantidades = new Map();
    for (const item of items) {
        cantidades.set(item.idProducto, (cantidades.get(item.idProducto) || 0) + Number(item.cantidad));
    }
    return Array.from(cantidades, ([idProducto, cantidad]) => new ItemCarrito(idProducto, cantidad));
}

// Revisa uno por uno los productos del carrito con el precio y el stock reales de la BD
// y calcula subtotal, IVA y total. Un producto que no existe, está desactivado o no alcanza va a "excedidos"
function calcularResumen(items, callback) {
    const itemsConPrecio = [];//Aqui guardamos ya todos los productos con sus datos, ya que recibimos los productos sin esto
    const excedidos = [];//Este arreglo guarda todos aquellos productos con stock menor a la cantidad solicitada
    let subtotalCentavos = 0;//Calculamos en centamos, empezamos en 0
    let indice = 0; // En qué producto del arreglo vamos
    
    // Cada consulta es asíncrona, por eso en vez de un for la función se llama a sí misma al terminar cada producto
    function revisarSiguiente() {
        if (indice >= items.length) {//Condicion base, si ya estamos al final del arreglo, ya no hay nada más que recorrer
            const ivaCentavos = Math.round(subtotalCentavos * 0.16);//Obtenemos el IVA
            callback(null, new ResumenVenta(//Guardamos ya los valores adecuados para procesamiento
                aMonto(subtotalCentavos),
                aMonto(ivaCentavos),
                aMonto(subtotalCentavos + ivaCentavos),
                itemsConPrecio,
                excedidos
            ));
            return;
        }
        const item = items[indice];
        productoService.obtenerProductoPorId(item.idProducto, (error, producto) => {
            if (error) {
                callback(error, null);
                return;
            }
            //Si el producto no existe, o no es activo, o si su stock es menor a lo solicitado, entonces es excedido y se cancela la transaccion
            if (!producto || !producto.activo || producto.stock < item.cantidad) {
                excedidos.push(item);
            } else {
                //En caso contrario guardamos
                itemsConPrecio.push(new ItemVenta(item.idProducto, item.cantidad, producto.precio));
                subtotalCentavos += aCentavos(producto.precio) * item.cantidad;
            }
            indice++;//Como usamos recursividad avanzamos
            revisarSiguiente();
        });
    }
    revisarSiguiente();
}
// Inserta el detalle de cada producto y descuenta su stock, uno por uno, dentro de la transacción
function registrarDetalleYStock(conexion, idVenta, items, indice, callback) {
    if (indice >= items.length) {//Si no hay elementos,, no hay nada que agregar
        callback(null);
        return;
    }
    const item = items[indice];//obtenemos los elementos del indice mandado
    ventaService.insertarDetalleVenta(conexion, idVenta, item, (error) => {
        if (error) {
            callback(error);
            return;
        }
        //Como vamos a comprar ese producto, hay que descontar, hacemos transacciones para hacer todo o nada
        ventaService.descontarStock(conexion, item.idProducto, item.cantidad, (error, resultado) => {
            if (error) {
                callback(error);
                return;
            }
            // Si no se descontó nada es porque otro cliente compró ese stock mientras se procesaba este pago
            if (resultado.affectedRows === 0) {
                callback(new ErrorApp(409, 'Un producto ya no tiene stock suficiente'));
                return;
            }
            registrarDetalleYStock(conexion, idVenta, items, indice + 1, callback);
        });
    });
}
// Registra la venta completa: todo pasa junto o no pasa nada (transacción)
function registrarVenta(idUsuario, rfcCliente, resumen, callback) {
    const idVenta = crypto.randomUUID();//Generamos un UUID aleatorio
    transaccionService.iniciarTransaccion((error, conexion) => {//Usamos el servicio de transacciones para solicitar una a la BD y hacer todo o nada
        if (error) {
            callback(error, null);
            return;
        }
        //Primero incertamos la venta, para obtener un ID e incertar los detalles de venta
        ventaService.insertarVenta(conexion, idVenta, idUsuario, resumen.total, rfcCliente || null, (error) => {
            if (error) {
                transaccionService.cancelarTransaccion(conexion);
                callback(error, null);
                return;
            }
            //Registramos usando la funcion que declare aqui arriba que ya hace este proceso
            registrarDetalleYStock(conexion, idVenta, resumen.items, 0, (error) => {
                if (error) {//Si al menos 1 no es correcto cancelamos todo
                    transaccionService.cancelarTransaccion(conexion);
                    callback(error, null);
                    return;
                }
                //Despues de agregar todos, ya podemos validar todo
                transaccionService.confirmarTransaccion(conexion, (error) => {
                    if (error) {
                        callback(error, null);
                        return;
                    }
                    callback(null, idVenta);
                });
            });
        });
    });
}
const calcularResumenAsync = promisify(calcularResumen);//Como se me ocurrio hacer todo con callbacks, no puedo hacer el formato de await asi normal, asi que me toca usar este convertidor
//basicamente convierte mi callback function a una promesa, y asi ya puedo usar await
const registrarVentaAsync = promisify(registrarVenta);

async function procesarInicioPago(idUsuario, rfcCliente, items) {
    const errorValidacion = validarCompra(rfcCliente, items);
    
    if (errorValidacion) {
        throw errorValidacion;
    }
    // El total sale de los precios reales de la BD, nunca de lo que diga la pantalla del cliente
    
    const resumen = await calcularResumenAsync(unificarItems(items));

    if (resumen.excedidos.length > 0) {//Si hay productos de la venta los cuales fueron excedidos directamente mandamos a error
        throw new ErrorApp(400, 'Stock insuficiente para algunos productos');
    }
    //Ahora si, utilizamos el servicio de crear orden para que PayPal nos retorne un ID donde el usuario pueda comprar y efectuar el pago
    const orden = await paypalService.crearOrden({
        intent: 'CAPTURE',
        purchase_units: [{
            custom_id: idUsuario,//mandamos el ID del usuario y aparte mandamos la moneda en decimal (con 2) y en pesos
            amount: { currency_code: 'MXN', value: resumen.total.toFixed(2) }
        }],
        application_context: { return_url: URL_RETORNO, cancel_url: URL_CANCELACION }
    });
    //PayPal no da el enlace directo, hay que buscarlo en la lista de links de la respuesta
    const enlace = (orden.links || []).find(link => link.rel === 'approve' || link.rel === 'payer-action');
    if (!enlace) {
        throw new ErrorApp(500, 'PayPal no devolvió el enlace de pago');
    }
    return new RespuestaPago(true, enlace.href, orden.id);
}

async function procesarCaptura(orderID, idUsuario, rfcCliente, items) {
    //Usamos regex para comprobar el orderID, si no cincide directamente da error, esto evita intentos de intrusos
    if (typeof orderID !== 'string' || !/^[A-Za-z0-9_-]{5,64}$/.test(orderID)) {
        throw new ErrorApp(400, 'El orderID de PayPal no es válido');
    }
    const errorValidacion = validarCompra(rfcCliente, items);
    if (errorValidacion) {
        throw errorValidacion;
    }
    // Se vuelve a calcular el total con los precios reales: lo que mande el navegador no se toma como verdad
    const resumen = await calcularResumenAsync(unificarItems(items));
    if (resumen.excedidos.length > 0) {
        throw new ErrorApp(400, 'Stock insuficiente para algunos productos');
    }
    let captura;
    try {
        captura = await paypalService.capturarOrden(orderID);
    } catch (error) {//Si PayPal rechaza el pago (o la orden ya se había cobrado) no se registra la venta
        throw new ErrorApp(400, 'El pago no se completó en PayPal');
    }
    const datosCaptura = captura.purchase_units?.[0]?.payments?.captures?.[0];
    if (captura.status !== 'COMPLETED' || !datosCaptura) {
        throw new ErrorApp(400, 'El pago no se completó en PayPal');
    }
    // El monto que PayPal confirma debe ser exactamente el total de la compra, si esto no ocurre es posible que el pago que se intento realizar fue manipulado
    if (datosCaptura.amount.value !== resumen.total.toFixed(2)) {
        try {
            await paypalService.reembolsarCaptura(datosCaptura.id);
        } catch (errorReembolso) {
            console.error('No se pudo reembolsar el pago', errorReembolso);
        }
        throw new ErrorApp(400, 'El monto cobrado no coincide con el total de la compra');
    }
    // Solo si PayPal ya confirmó el dinero se registra la venta y se descuenta el stock
    let idVenta;
    try {
        idVenta = await registrarVentaAsync(idUsuario, rfcCliente, resumen);//Aqui ademas de hacer el pago, en una misma transaccion ocurre el proceso de guardado, donde si no funciona se cancela todo y el pago
    } catch (error) {
        console.error(error);//Aqui recibimos el error de cuando por ejemplo, alguien mas habia hecho la compra al momento y no se pudo registrar
        try {
            await paypalService.reembolsarCaptura(datosCaptura.id);
        } catch (errorReembolso) {
            console.error('No se pudo reembolsar el pago', errorReembolso);
        }
        throw new ErrorApp(400, 'La venta no se completo');
    }

    // La factura se manda sin hacer esperar al cliente. Si el correo falla la venta ya quedó registrada
    // y solo se deja el error en el servidor
    facturaController.enviarFactura(idUsuario, idVenta, (error) => {
        if (error) {
            console.error('No se pudo enviar la factura de la venta ');//Si no se completa no detenemos la venta, ya que la factura aun se puede descargar desde el sitio
            //entonces no existe realmente un riesgo de no poder mandarla, de esta forma protejemos en caso de errores al mandar
        }
    });
    return new RespuestaVenta(true, idVenta, 'Venta registrada correctamente');
}

// Traduce cualquier error interno a un ErrorApp que la ruta pueda responder
function convertirError(error) {
    if (error instanceof ErrorApp) {//Si el error ya es tipo ErrorApp, pues no hay que convertir nada asi que lo devolvemos directamente
        return error;
    }
    //Estos son de un tipo especifico, que se recibe desde una funcion arriba por un service
    if (error.rechazada) {
        return new ErrorApp(400, 'PayPal rechazó la operación de pago');
    }
    return new ErrorApp(500, 'Error al procesar el pago');
}
//Bueno, esta funcion se encarga de iniciar el pago, y es la que idealmente se usaria desde las rutas para el proceso de venta
async function iniciarPagoPayPal(idUsuario, rfcCliente,confirmacionTerminosYCondiciones, items, callback) {
    if(!confirmacionTerminosYCondiciones || confirmacionTerminosYCondiciones!==true){//Si no acepta los terminos estariamos en problemas legales
        callback(new ErrorApp(400, 'El sistema exige que los Términos y Condiciones sean leidos y aceptados'), null);
        return;
    }
    let respuesta;
    try {//OJOOO, AQUI USAMOS TRY Y CATCH, ya que en algunas funciones emitimos Throw new, esos son recibidos por el try y catch
        respuesta = await procesarInicioPago(idUsuario, rfcCliente, items);
    } catch (error) {//y aqui usamos la funcion de convertir para darle un formato mas "family friendly" a la ruta que lo implemente
        
        callback(convertirError(error), null);
        return;
    }
    callback(null, respuesta);
}

// Captura el pago solo si todo coincide y, hasta entonces, registra la venta
async function capturarPagoPayPal(orderID, idUsuario, rfcCliente, items, callback) {
    let respuesta;
    try {//No volvere a explicar esto 2 veces, pero es lo mismo de arriba, es para poder recibir los errores de throw new
        respuesta = await procesarCaptura(orderID, idUsuario, rfcCliente, items);
    } catch (error) {
        callback(convertirError(error), null);
        return;
    }
    callback(null, respuesta);
}

module.exports = {//Aqui simplemente ocultamos la complejidad de todo nuestro controller, no es necesario que una ruta deba usar todo, con esto es lo correcto
    //Aqui se implementa un patron de diseño, ovlide el nombre, pero basicamente es reducir la complejidad para otros modulos para evitar mezclar dependencias
    //y simplificar la gestión
    iniciarPagoPayPal,
    capturarPagoPayPal,
};