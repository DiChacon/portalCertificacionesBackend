import { UserModel } from '../models/user.model.js';

export class DataValidator {

    /**
         * Genera una cadena aleatoria de caracteres alfanuméricos en mayúsculas.
         *
         * @param {number} length - Longitud de la cadena a generar (por defecto es 5).
         * @returns {string} Cadena aleatoria compuesta por letras mayúsculas (A-Z) y dígitos (0-9).
         *
         * @example
         * const id = Clase.getRandomId(); // "A1B9Z"
         * const id = Clase.getRandomId(8); // "K3D9F7L2"
     */

    static getRandomId(length = 5) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';

        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return result;
    }
    static getRandomNumericId(length = 5) {
        const chars = '0123456789';
        let result = '';

        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
         * Valida si una cadena tiene el formato de un correo electrónico válido.
         *
         * Utiliza una expresión regular simple para comprobar que la estructura del correo
         * cumpla con el formato general: texto@texto.dominio
         *
         * @param {string} correo - Cadena que representa el correo electrónico a validar.
         * @returns {boolean} `true` si el correo tiene un formato válido, `false` en caso contrario.
         *
         * @example
         * isEmailValid("usuario@dominio.com");   // true
         * isEmailValid("usuario@dominio");       // false
         * isEmailValid("usuario@.com");          // false
     */
    static isEmailValid(correo) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
        return regex.test(correo);
    }

    /**
         * Verifica si un arreglo contiene al menos un objeto JSON no vacío.
         *
         * La función retorna `true` si al menos un elemento del arreglo es un objeto no nulo
         * que tiene al menos una clave con un valor definido (no `undefined`).
         * Útil para validar respuestas de APIs o estructuras de datos antes de procesarlas.
         *
         * @param {any[]} data - Arreglo que se espera contenga objetos tipo JSON.
         * @returns {boolean} `true` si existe al menos un objeto válido con contenido, `false` en caso contrario.
         *
         * @example
         * notEmptyJson([{ nombre: "Juan" }, {}]);         // true
         * notEmptyJson([{}, { edad: undefined }]);        // false
         * notEmptyJson("no es un arreglo");               // false
         * notEmptyJson([{ nombre: undefined }]);          // false
     */
    static notEmptyJson(data) {
        if (!Array.isArray(data)) return false;

        return data.some(item => {
            if (typeof item !== 'object' || item === null) return false;

            const keys = Object.keys(item);
            return keys.length > 0 && keys.some(key => item[key] !== undefined);
        });
    }

    /**
         * Valida una lista de usuarios en formato JSON.
         *
         * Realiza múltiples validaciones sobre cada usuario:
         * - Verifica que la estructura JSON no esté vacía ni sea inválida.
         * - Valida que los campos requeridos (`nombre`, `app`, `apm`, `correo`) estén presentes.
         * - Comprueba que el correo electrónico tenga un formato válido.
         * - Verifica que la longitud de ciertos campos no exceda un límite máximo:
         *   - `nombre`: máximo 50 caracteres.
         *   - `app`: máximo 25 caracteres.
         *   - `apm`: máximo 25 caracteres.
         *
         * En caso de encontrar errores, se detalla por cada usuario (con su número de fila, asumiendo encabezado en la fila 1).
         *
         * @param {Array<Object>} users - Arreglo de objetos de usuarios a validar. Cada objeto debe contener:
         *   - `nombre`: string
         *   - `app`: string (apellido paterno)
         *   - `apm`: string (apellido materno)
         *   - `correo`: string
         *
         * @returns {{
         *   validated: boolean,
         *   errors: Array<{ user: number | 'all', errors: string[] }>
         * }} Objeto con el resultado de la validación:
         * - `validated`: `true` si todos los usuarios son válidos.
         * - `errors`: lista de errores por usuario, incluyendo la fila y los mensajes asociados.
         *
         * @example
         * const resultado = Clase.validateUsers(usuarios);
         * if (!resultado.validated) {
         *   console.log(resultado.errors);
         * }
     */

    static validateUsers(users) {
        const result = {
            validated: false,
            errors: []
        };

        // Validate JSON structure
        if (!this.notEmptyJson(users)) {
            result.errors.push({
                user: 'all',
                errors: ['El JSON de usuarios está vacío o no es válido']
            });
            return result;
        }

        // Validate each user
        users.forEach((user, index) => {
            const row = index + 2;
            const userErrors = {
                user: row,
                errors: []
            };

            const { nombre, app, apm, correo } = user;

            // Required fields check
            const requiredFields = { nombre, app, apm, correo };
            const missingFields = Object.entries(requiredFields)
                .filter(([_, value]) => !value)
                .map(([field]) => field);

            if (missingFields.length > 0) {
                userErrors.errors.push(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
            }

            // Email validation
            if (correo && !this.isEmailValid(correo)) {
                userErrors.errors.push('Correo electrónico no válido');
            }

            // Field length validation
            const lengthValidations = [
                { field: 'nombre', value: nombre, max: 50 },
                { field: 'app', value: app, max: 25 },
                { field: 'apm', value: apm, max: 25 }
            ];

            lengthValidations.forEach(({ field, value, max }) => {
                if (value && value.length > max) {
                    userErrors.errors.push(`${field} excede el máximo de ${max} caracteres`);
                }
            });

            if (userErrors.errors.length > 0) {
                result.errors.push(userErrors);
            }
        });

        result.validated = result.errors.length === 0;
        return result;
    }

    /**
         * Verifica qué usuarios no están duplicados en la base de datos, comparando sus correos electrónicos.
         *
         * Esta función:
         * - Extrae y normaliza los correos electrónicos del arreglo recibido (minúsculas y sin espacios).
         * - Consulta en la base de datos (`UserModel`) cuáles de esos correos ya existen.
         * - Devuelve un resumen con los usuarios únicos (no duplicados) y estadísticas sobre los duplicados.
         *
         * @param {Array<{ correo: string }>} users - Arreglo de objetos de usuarios, cada uno con una propiedad `correo`.
         *
         * @returns {Promise<{
         *   uniqueUsers: Array<Object>,        // Usuarios cuyo correo no existe en la base de datos
         *   totalUsers: number,                // Total de usuarios recibidos
         *   totalUniqueUsers: number,         // Total de usuarios no duplicados
         *   duplicates: number,               // Cantidad de correos que ya existen en la base de datos
         *   duplicateEmails: string[]         // Lista de correos duplicados encontrados
         * }>} Resultado de la verificación
         *
         * @throws {Error} Si ocurre algún error al consultar la base de datos.
         *
         * @example
         * const resultado = await Clase.notDuplicatedUsers(listaUsuarios);
         * console.log(resultado.uniqueUsers); // Usuarios que se pueden registrar
         * console.log(resultado.duplicateEmails); // Correos ya registrados
     */

    static async notDuplicatedUsers(users) {
        try {
            //Extraer los correos electrónicos y convertirlos a minúsculas
            const emails = users.map(user => user.correo?.toLowerCase().trim());
            //Buscar los correos electrónicos existentes en la base de datos
            const existingUsers = await UserModel.findAll({
                attributes: ['correo'],
                where: {
                    correo: emails
                },
                raw: true
            });
            //Convertir los correos electrónicos existentes a un Set para una búsqueda rápida
            const existingEmails = new Set(
                existingUsers.map(user => user.correo?.toLowerCase().trim())
            );

            //Filtrar los usuarios para obtener solo aquellos cuyos correos electrónicos no están en la base de datos
            const uniqueUsers = users.filter(user =>
                !existingEmails.has(user.correo?.toLowerCase().trim())
            );
            return {
                uniqueUsers,
                totalUsers: users.length,
                totalUniqueUsers: uniqueUsers.length,
                duplicates: existingUsers.length,
                duplicateEmails: users
                    .filter(user => existingEmails.has(user.correo?.toLowerCase().trim()))
                    .map(user => user.correo)
            };
        } catch (error) {
            console.error('Error checking duplicate users:', error);
            throw error;
        }
    }
}

export default DataValidator;