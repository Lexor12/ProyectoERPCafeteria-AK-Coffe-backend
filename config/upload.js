// Configuracion de donde y como se guardan las imagenes subidas
const fs = require('fs');//Es una libreria para acceder al sistema de archivos (file System) y poder hacer modificaciones
const path = require('path');

const CARPETA_UPLOADS = path.join(__dirname, '../uploads');
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp']; // RQNF19
const TAMANO_MAXIMO_BYTES = 2 * 1024 * 1024; // RQNF20: 2 MB

// Asegura que la carpeta exista al arrancar el servidor
if (!fs.existsSync(CARPETA_UPLOADS)) {
    fs.mkdirSync(CARPETA_UPLOADS, { recursive: true });
}

/* Recibe el string completo que manda Angular, en base64
y separa esa metadata del contenido real de la imagen, como este tipo de formato
esta bien definido por partes, simplemente analizamos la composición del mismo para
procesar una imagen
*/ 
function decodificarImagen(dataUrlBase64) {
    // Si el string no existe o no empieza como esperamos, ya sabemos que está mal
    if (!dataUrlBase64 || !dataUrlBase64.startsWith('data:')) {throw new Error('La imagen no tiene el formato esperado.');}

    // .split(',') parte el string en 2 pedazos usando la primera coma que encuentre, tipo quedaria un tal que así:
    // encabezado = "data:image/png;base64"
    // contenidoBase64 = "iVBORw0KGgoAAAANSU..." ( es decir el archivo real pero en codificado a base64)
    const partes = dataUrlBase64.split(',');
    const encabezado = partes[0];
    const contenidoBase64 = partes[1];

    if (!encabezado || !contenidoBase64) {//Si el formato anterior no se cumple significa que no es una imagen y se cancela
        throw new Error('La imagen no tiene el formato esperado.');
    }

    // Ahora extraemos el tipo de imagen (jpeg, png, webp) revisando qué texto contiene el encabezado.
    let extension;

    if (encabezado.includes('image/png')) {
        extension = 'png';
    } else if (encabezado.includes('image/webp')) {
        extension = 'webp';
    } else if (encabezado.includes('image/jpeg')) {
        extension = 'jpg';
    } else {
        // Si no es ninguno de los 3 permitidos, rechazamos
        throw new Error('Formato de imagen no válido. Solo se aceptan JPG, PNG o WEBP.');
    }

    // Buffer.from(texto, 'base64') es lo que realmente "traduce" el texto codificado
    // de vuelta a los bytes originales del archivo.
    const buffer = Buffer.from(contenidoBase64, 'base64');

    // buffer.length nos dice cuántos bytes pesa el archivo ya "traducido"
    if (buffer.length > TAMANO_MAXIMO_BYTES) {
        throw new Error('La imagen no debe superar los 2 MB.');
    }

    return { buffer, extension };
}

// Guarda el archivo en disco con nombre basado en el id del producto,
// borrando cualquier imagen anterior con el mismo id pero distinta extensión
function guardarImagen(idProducto, buffer, extension) {
    // Elimina cualquier versión previa (jpg/png/webp) para no dejar archivos huérfanos
    ['jpg', 'png', 'webp'].forEach(ext => {
        const rutaAnterior = path.join(CARPETA_UPLOADS, `${idProducto}.${ext}`);
        if (fs.existsSync(rutaAnterior)) {
            fs.unlinkSync(rutaAnterior);
        }
    });

    const nombreArchivo = `${idProducto}.${extension}`;
    const rutaCompleta = path.join(CARPETA_UPLOADS, nombreArchivo);
    fs.writeFileSync(rutaCompleta, buffer);

    return `uploads/${nombreArchivo}`; // ruta pública generada automáticamente
}

// Elimina la imagen de un producto sin eliminar el producto
function eliminarImagenArchivo(rutaImagen) {
    if (!rutaImagen) return;
    const rutaCompleta = path.join(__dirname, '..', rutaImagen);
    if (fs.existsSync(rutaCompleta)) {
        fs.unlinkSync(rutaCompleta);
    }
}

module.exports = {
    decodificarImagen,
    guardarImagen,
    eliminarImagenArchivo,
};