//Este modelo guarda lo que es el archivo XML que se crea en la factura, este 
//contiene el nombre del archivo y como contenido lleva el XML
class ArchivoXml{
    constructor(nombreArchivo,contenido){
        this.nombreArchivo=nombreArchivo
        this.contenido=contenido
    }
}
module.exports={ArchivoXml}