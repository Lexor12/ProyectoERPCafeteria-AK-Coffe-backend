const { Resend } = require('resend');

// Envía al cliente un correo con el comprobante XML adjunto
async function enviarFactura(correoDestino, nombreCliente, archivo) {
    //La instancia se crea aquí: si falta la clave en el .env el error es del envío y no tumba el arranque del servidor
    const resend = new Resend(process.env.RESEND_API_KEY);
    const respuesta = await resend.emails.send({
        from: 'onboarding@resend.dev',//Usamos on boardin de resend, ya que como aun no tenemos un nombre de dominio, resend solo permite enviar correos
        //de prueba a la dirección que creo la cuenta de su servicio
        to: correoDestino,
        subject: 'Factura de tu compra - AK Coffe',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>¡Gracias por tu compra en AK Coffe!</h2>
                <p>Hola <strong>${nombreCliente}</strong>, adjunto a este correo encontrarás el archivo XML con los datos fiscales de tu compra.</p>
            </div>
        `,
        attachments: [//Usamos attachments, como un arreglo de archivos adjuntos
            {//Agregamos  el archivo con su nombre
                filename: archivo.nombreArchivo,
                content: Buffer.from(archivo.contenido, 'utf8'),//Aqui definimos el formato, usamos utf8 para usar caracteres estandar
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