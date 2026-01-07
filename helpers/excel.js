import XlsxPopulate from 'xlsx-populate';

class Excel {
    constructor() {
        this.excel = XlsxPopulate;
    }

    //Esta función recibe una matriz (arreglo de arreglos) donde el primero arreglo contiene los encabeazdos de la tabla.
    async convertToJson(data) {
        console.log('Convirtiendo datos a JSON, data inicial:', data);
        let datas = data;

        //Elimina filas vacías
        for (const row of datas) {
            if (row.every(cell => cell === null || cell === undefined || cell === '')) {
                datas = datas.filter(r => r !== row);
            }
        }

        //Toma un string y lo normaliza.
        const normalizeHeader = (str) => {
            return str
                ?.toString()
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '_') // Reemplaza espacios por guión bajo
                .replace(/[^\w]/g, ''); // Elimina caracteres no alfanuméricos
        };

        //Toma los encabezados del excel(el primer arreglo) para normalizarlo.
        const headers = datas[0].map(normalizeHeader);
        //Guarda en rows los datos sin el encabezado.
        const rows = datas.slice(1);
        //Arma la estructura json con los pares clave-valor para cada registro del excel.
        const jsonData = rows.map(row => {
            const obj = {};
            headers.forEach((key, i) => {
                obj[key] = row[i]?.toString().trim();
            });
            return obj;
        });
        console.log('Convirtiendo datos a JSON, data final:', datas);
        return jsonData;
    }

    /**
        * @description
        * Lee archivos excel que contienen una sola hoja y devuelve su contenido en formato json.
    */
    async readOneSheet(buffer) {
        const workbook = await this.excel.fromDataAsync(buffer); // Carga el excel a la variable woorkbook
        const sheet = workbook.sheets()[0]; //Toma la primer hoja del documento
        const data = sheet.usedRange().value(); // Lee toda la hoja del excel
        const jsonData = await this.convertToJson(data);//Convierte la matriz proporcionada por xlsx a un arreglo json.
        return jsonData;
    }
}
export const ExcelHelper = new Excel();
export default ExcelHelper;