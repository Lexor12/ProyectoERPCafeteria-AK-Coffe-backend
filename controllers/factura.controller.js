//El controller arma el comprobante XML del pedido y lo envía al correo del cliente
const authService = require('../services/auth.service');
const emailService = require('../services/email.service');
const pedidoClienteController = require('./pedido.controller');
const { ErrorApp } = require('../models/errorApp.model');
const { ArchivoXml } = require('../models/archivoXml.model');

// Los textos que van dentro del XML no pueden llevar estos caracteres tal cual (rompen el archivo)
function escaparXml(valor) {
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Arma el comprobante con los datos a XML, este es el archivo o contenido que estariamos enviado por correo al usuario como factura
//recibimos como tal un pedido
function armarXml(pedido) {
    //Calculamos el subtotal como la suma de todos los subtotales de cada producto
    const subtotal = Math.round(pedido.productos.reduce((suma, p) => suma + Number(p.subtotal), 0) * 100) / 100;
    //El iva se aplica al subtotal con 16%
    const iva = Math.round(subtotal * 0.16 * 100) / 100;
    //El precio total es el resultado de sumar el subtotal con el iva
    const precioTotal = Math.round((subtotal + iva) * 100) / 100;

    const procesoTexto = pedido.entregado ? 'ENTREGADO' : 'PENDIENTE';
    const estadoTexto = pedido.cancelado ? 'CANCELADO' : 'ACTIVO';

    return `<?xml version="1.0" encoding="UTF-8"?>
    <Comprobante version="1.0" idVenta="${escaparXml(pedido.idVenta)}" fechaCompra="${escaparXml(pedido.fechaCompra)}">
        <Tienda>
            <Nombre>${escaparXml(pedido.nombreTienda)}</Nombre>
            <Rfc>${escaparXml(pedido.rfcTienda)}</Rfc>
            <Telefono>${escaparXml(pedido.telefonoTienda)}</Telefono>
            <DomicilioFiscal>${escaparXml(pedido.domicilioFiscalTienda)}</DomicilioFiscal>
            <RegimenFiscal>${escaparXml(pedido.regimenFiscalTienda)}</RegimenFiscal>
        </Tienda>
        <Cliente>
            <Nombre>${escaparXml(pedido.nombreCliente)}</Nombre>
            <Apellido>${escaparXml(pedido.apellidoCliente)}</Apellido>
            <Rfc>${escaparXml(pedido.rfcCliente || 'Sin RFC')}</Rfc>
        </Cliente>
        <EstadoPedido>
            <Entrega>${procesoTexto}</Entrega>
            <Estado>${estadoTexto}</Estado>
        </EstadoPedido>
        <Conceptos>
            ${pedido.productos.map(p => `
            <Producto>
                <Nombre>${escaparXml(p.nombre)}</Nombre>
                <Cantidad>${p.cantidad}</Cantidad>
                <PrecioUnitario>${Number(p.precioUnitario).toFixed(2)}</PrecioUnitario>
                <Subtotal>${Number(p.subtotal).toFixed(2)}</Subtotal>
            </Producto>
            `).join('')}
        </Conceptos>
        <Totales>
            <SubtotalGeneral>${subtotal.toFixed(2)}</SubtotalGeneral>
            <Iva>${iva.toFixed(2)}</Iva>
            <PrecioTotal>${precioTotal.toFixed(2)}</PrecioTotal>
        </Totales>
    </Comprobante>`;
}

// Envía la factura de UNA venta al correo con el que el cliente se registró
// Nunca lanza errores: cualquier problema se regresa por el callback para que quien la llame decida qué hacer
function enviarFactura(idUsuario, idVenta, callback) {
    pedidoClienteController.obtenerPedidoCliente(idUsuario, idVenta, (error, pedido) => {
        if (error) {//Si directamente obtuvimos un error al tratar de obtner los datos de un pedido damos error
            callback(error, null);
            return;
        }
        //Si todo sale bien, buscamos los datos del usuario, especificamente el correo
        authService.buscarUsuarioPorId(idUsuario, (error, usuario) => {
            if (error || !usuario) {
                callback(error || new ErrorApp(404, 'Usuario no encontrado'), null);
                return;
            }
            //Creamos nuestro archivo xml que vamos a enviar por Resend
            let archivo;
            try {
                archivo = new ArchivoXml(`factura-${pedido.idVenta}.xml`, armarXml(pedido));
            } catch (errorXml) {
                //Si nos da error al crearse cancelamos el proceso y mandamos error
                callback(errorXml, null);
                return;
            }
            //En caso de que todo lo anterior se haya podido efectuar, entonces ya hacemos la peticion al servicio de resend para enviar el correo al usuario
            //aqui usamos el formato de promesa ya que en su momento hice esta función async y no con callback
            emailService.enviarFactura(usuario.correo, usuario.nombre, archivo).then(
                () => callback(null, true),
                (errorCorreo) => callback(errorCorreo, null)
            );
        });
    });
}

module.exports = {
    enviarFactura,
};