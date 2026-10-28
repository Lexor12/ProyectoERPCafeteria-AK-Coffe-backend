//config
// Funciones chiquitas de validación de formato, reutilizables en cualquier ruta
// Ninguna de estas toca la BD, solo revisan que el dato tenga la forma correcta

//nombre y apellido solo letras (con acentos y ñ) y espacios, 2-50
function esNombreValido(texto) {
    if (typeof texto !== 'string') return false;
    const regex = /^[a-zA-ZÀ-ÿñÑ\s]{2,50}$/;
    return regex.test(texto.trim());
}

//es para el formato estándar de correo
function esCorreoValido(texto) {
    if (typeof texto !== 'string') return false;
    if (texto.length > 100) return false;
    const regex = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
    return regex.test(texto);
}

//para validar contraseña de 8 a 64, al menos una mayúscula y un número
function esContrasenaValida(texto) {
    if (typeof texto !== 'string') return false;
    if (texto.length < 8 || texto.length > 64) return false;
    const regex = /^(?=.*\p{Lu})(?=.*[0-9]).+$/u;
    return regex.test(texto);
}

//teléfon de solo dígitos exactamente 10
function esTelefonoValido(texto) {
    if (typeof texto !== 'string') return false;
    const regex = /^[0-9]{10}$/;
    return regex.test(texto);
}

//RFC, 12-13 caracteres alfanuméricos, comprobamos que sea o persona moral (una organización por ejemplo civil o S.A de C.V) o física (trabajador)
function esRfcValido(texto) {
    if (typeof texto !== 'string') return false;
    // Convertimos mayúsculas para evitar errores
    const rfc = texto.toUpperCase();
    // Estas expresiones permiten identificar y verificar a una persona Moral (12 caracteres) y Persona Física (13 caracteres)
    const regexPersonaMoral = /^[A-Z&Ñ]{3}[0-9]{6}[A-V0-9][A-Z0-9][0-9A]$/;
    const regexPersonaFisica = /^[A-Z&Ñ]{4}[0-9]{6}[A-V0-9][A-Z0-9][0-9A]$/;
    return regexPersonaMoral.test(rfc) || regexPersonaFisica.test(rfc);
}

//Permite validar si un texto es de cierta longitud y limpia los espacios
function esLongitudValida(texto, min, max) {
    if (typeof texto !== 'string') return false;
    const limpio = texto.trim();
    return limpio.length >= min && limpio.length <= max;
}

// permite validar si un decimal mayor a 0, máximo 2 decimales
function esDecimalPositivoValido(valor) {
    if (valor === null || valor === undefined || valor === '') return false;
    const numero = Number(valor);
    if (isNaN(numero) || numero <= 0) return false;
    // Revisamos que no tenga más de 2 decimales, comparando el valor redondeado contra el original
    return Math.round(numero * 100) / 100 === numero;
}

//permite validar si un numero es entero mayor a 0
function esEnteroPositivoValido(valor) {
    if (valor === null || valor === undefined || valor === '') return false;
    const numero = Number(valor);
    return Number.isInteger(numero) && numero > 0;
}

//permite saber si una hora es correcta o no, este es bastante simple, pero lo agrego para seguir pues una "secuencia", es basicamente lo que evalua si de las asistencias la hora es adecuada
function esHoraFinPosterior(horaInicio, horaFin) {
    if (!horaInicio || !horaFin) return false;
    return horaFin > horaInicio; // Como formato "HH:mm:ss" es comparable como texto directamente
}

//Aqui validamos todos los IDs son UUID compuestos de 36 caracteres, esta es una validacion que se hace a todos los endpoints para verificar que el id sea correcto
function esUuidValido(texto) {
    if (typeof texto !== 'string') return false;
    const regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return regex.test(texto);
}

// Este permite verificar que todas las fecha esten en formato yyyy-MM-dd y que sea una fecha real
function esFechaValida(texto) {
    if (typeof texto !== 'string') return false;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(texto)) return false;
    const fecha = new Date(texto);
    return !isNaN(fecha.getTime());//Si es true de no ser un número se retorna false
    //Si es false, ya que si es un número, como validamos con !, entonces si es correcto pq false si es false, asi que es true
}

//Exportamos todas las funcioes para que puedan ser utilizadas
module.exports = {
    esNombreValido,
    esCorreoValido,
    esContrasenaValida,
    esTelefonoValido,
    esRfcValido,
    esLongitudValida,
    esDecimalPositivoValido,
    esEnteroPositivoValido,
    esHoraFinPosterior,
    esUuidValido,
    esFechaValida,
};