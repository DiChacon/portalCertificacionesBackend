import multer from 'multer';
import path from 'path';

export class UploadFile {

    static createMulterConfig(subDir) {
        const fullPath = path.resolve(subDir); // Ruta absoluta al subdirectorio

        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, fullPath); // Directorio dinámico
            },
            filename: (req, file, cb) => {
                cb(null, Date.now() + path.extname(file.originalname)); // Nombre único
            }
        });

        return multer({ storage });
    }

    static unica(fieldName, subDir) {
        console.log('Pasa por Mullter');

        const upload = UploadFile.createMulterConfig(subDir);
        return upload.single(fieldName);
    }

    //Configuración de multer para subir archivos Excel
    //Se guarda en memoria RAM y se procesa directamente sin guardarlo en disco
    static createMulterConfigForExcel() {
        const fileFilter = (req, file, cb) => {
            const allowed = ['.xlsx'];
            const ext = path.extname(file.originalname);
            if (allowed.includes(ext)) cb(null, true);
            else cb(new Error('Tipo de archivo no permitido'), false);
        };
        const config = {
            storage: multer.memoryStorage(), //El archivo se guarda en la memoria RAM mientras se procesa (no se guarda definitivamente)
            fileFilter, //Solo acepta archivos con extensiones .xlsx
        }
        return multer(config);
    }

    static readExcel(fieldName = 'fieldName') {
        console.log('Pasa por Mullter para leer excel');

        const upload = this.createMulterConfigForExcel();
        return upload.single(fieldName);
    }

}
