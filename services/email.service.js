const { Resend } = require('resend');

// Envía al cliente un correo con el comprobante XML adjunto
async function enviarFactura(correoDestino, nombreCliente, archivo) {
    //La instancia se crea aquí: si falta la clave en el .env el error es del envío y no tumba el arranque del servidor
    const resend = new Resend(process.env.RESEND_API_KEY);
    const respuesta = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: correoDestino,
        subject: 'Factura de tu compra - AK Coffe',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>¡Gracias por tu compra en AK Coffe!</h2>
                <p>Hola <strong>${nombreCliente}</strong>, adjunto a este correo encontrarás el archivo XML con los datos fiscales de tu compra.</p>
            </div>
        `,
        attachments: [
            {
                filename: archivo.nombreArchivo,
                content: Buffer.from(archivo.contenido, 'utf8'),
            },
        ],
    });
    //Resend no lanza error cuando rechaza el envío: lo regresa dentro de la respuesta
    if (respuesta.error) {
        throw new Error(respuesta.error.message);
    }
    return respuesta.data;
}

module.exports = {
    enviarFactura,
};