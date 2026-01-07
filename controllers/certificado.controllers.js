import { CertificadoQueries } from "../queries/certificado.query.js";
import { cursoQueries } from "../queries/curso.query.js";

export class CertificadoController {

    async create(req, res) {
        //En el body se debe enviar el id_examen, id_examen_perimso, folio, id_resultado
        //El Front-End debe mandar al controlador el id del permiso_examen, con ese id se consulta a la base de datos para obtener el campo fecha_expedido y después sumarle un día para ingresar a la base de datos la nueva fecha
        //req.body = {
        //     id_examen_permiso: INTEGER,
        //     id_curso: INTEGER,
        //     id_res: INTEGER
        //}
        const body = req.body;

        const query = await CertificadoQueries.store(body);

        if (query.ok) {
            return res.status(200).json({ ok: true, data: query.data });
        } else {
            return res.status(403).json({ ok: false, data: null, message: 'No se pudo crear el certificado.' });
        }
    }

    async findAll(req, res) {
        const condition = req.query;

        const query = await CertificadoQueries.findAll(condition);
        if (query.ok) {
            return res.status(200).json({ ok: true, data: query.data });
        } else {
            return res.status(403).json({ ok: false, data: null, message: 'No se pudieron encontrar los certificados.' })
        }
    }

    async findOne(req, res) {
        try {
            const condition = req.query;

            const query = await CertificadoQueries.findOne(condition);

            if (query.ok) {
                return res.status(200).json({ ok: true, data: query.data });
            } else {
                return res.status(403).json({ ok: false, message: 'No se pudo encontrar el certificado' });
            }
        } catch (error) {
            console.log('Error al encontrar el certificado: ', error);
            return res.status(500).json({ ok: false, message: 'Error en el servidor', error: error.message });
        }
    }

    async findWithUser(req, res) {
        try {
            const body = req.params.id;
            const query = await CertificadoQueries.findWithUser(body);

            if (query.ok) {
                return res.status(200).json({ ok: true, data: query.data });
            } else {
                return res.status(400).json({ ok: false, message: 'No se encontraron certificados para este usuario.' });
            }
        } catch (error) {
            console.error(error);
            return res.status(403).json({ ok: false, data: null, message: error });

        }
    }

    async findWithInstitucion(req, res) {
        try {
            const body = req.params.id;
            const query = await CertificadoQueries.findWithInstitucion(body);

            if (query.ok) {
                return res.status(200).json({ ok: true, data: query.data });
            } else {
                return res.status(204).json({ ok: false, message: 'No se encontraron certificados para esta institución.' });
            }
        } catch (error) {
            console.error(error);
            return res.status(403).json({ ok: false, data: null, message: error });

        }
    }

    async findNameCertifiedWithUser(req, res) {
        try {
            const body = req.params.id;
            const query = await CertificadoQueries.findWithUser(body);
            let certificados = [];

            // Usamos un Set para evitar duplicados
            const idsExamenAgregados = new Set();

            if (query.data.length == 0) return res.status(200).json({ ok: true, data: certificados, message: "No se encontraron certificados para este usuario" });

            // Se recorre cada elemento dentro de query.data
            for (let item of query.data) {

                // Se obtiene el examen desde la relación ResultadoModel → ExamenModel
                const examen = item?.ResultadoModel?.ExamenModel;

                // Si no hay examen asociado, se pasa al siguiente elemento
                if (!examen) continue;

                // Se extrae el id del examen
                const id_examen = examen.id_examen;

                // Si el examen aún no ha sido agregado al conjunto (para evitar duplicados)
                if (!idsExamenAgregados.has(id_examen)) {

                    // Se agrega el examen al arreglo de certificados con su id y nombre
                    certificados.push({
                        id_examen,
                        nombre_examen: examen.nombre_examen
                    });

                    // Se marca el id_examen como ya agregado
                    idsExamenAgregados.add(id_examen);
                }
            }

            if (query.ok) {
                return res.status(200).json({ ok: true, data: certificados });
            } else {
                return res.status(400).json({ ok: false, message: 'No se encontraron certificados para este usuario.' });
            }
        } catch (error) {
            console.error(error);
            return res.status(403).json({ ok: false, data: null, message: error });

        }
    }
}

export const certificadoController = new CertificadoController();