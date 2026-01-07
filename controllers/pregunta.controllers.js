import { preguntaQueries } from "../queries/pregunta.query.js";
class PreguntaController {

    async create(req, res) {
        try {
            const { descripcion, a, b, c, d, correcta, id_examen} = req.body;
            let material_apoyo = null;
            console.log(descripcion);
            
            if(req.file){
                material_apoyo= 'uploads/materiales/' + req.file.filename;
            }
            const query = await preguntaQueries.store({
                descripcion,
                material_apoyo,
                a,
                b,
                c,
                d,
                correcta,
                id_examen
            });
            if (query.ok) {
                return res.status(200).json({ ok: true, data: query.data });
            } else {
                return res.status(400).json({ ok: false, message: 'No se pudo crear la pregunta.' });
            }
        } catch (error) {
            console.error('Error en la creación de la pregunta', error);
            return res.status(400).json({ ok: false, message: error});
        }
    }

    async findAll(req, res) {
        const condition = req.query;

        const query = await preguntaQueries.findAll(condition);
        if (query.ok) {
            return res.status(200).json({ ok: true, data: query.data });
        } else {
            return res.status(403).json({ ok: false, data: null, message: 'No se pudieron encontrar las preguntas.' })
        }
    }

    async findOne(req, res) {
        try {
            const condition = req.query;

            const query = await preguntaQueries.findOne(condition);

            if (query.ok) {
                return res.status(200).json({ ok: true, data: query.data });
            } else {
                return res.status(403).json({ ok: false, message: 'No se pudo encontrar la pregunta' });
            }
        } catch (error) {
            console.log('Error al encontrar la pregunta.', error);
            return res.status(500).json({ ok: false, message: 'Error en el servidor', error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const id = req.params.id;

            const query = await preguntaQueries.delete(id);
            if (query.ok) {
                return res.status(200).json({ ok: true, message: 'Se eliminó la pregunta' });
            } else {
                console.log('la pregunta no se pudo eliminar.');
                return res.status(400).json({ ok: false, message: 'No se pudo eliminar la pregunta' });
            }
        } catch (error) {
            console.error('Error al eliminar la pregunta.', error);
            return res.status(404).json({ ok: false, message: 'No se pudo eliminar la pregunta especificada.' });
        }
    }

    async update(req, res) {
        try {
            const id = req.params.id;
            const datos = req.body;
            let material_apoyo = null;

            //En caso de que al actualizar venga un archivo
            if(req.file){

                material_apoyo = 'uploads/materiales/' + req.file.filename;
                datos.material_apoyo = material_apoyo;


                //Eliminar archivo anterior en caso de que exista uno anterior
                /* const pregunta = await PreguntaModel.findByPk(id);
                if(pregunta && pregunta.material_apoyo) {
                    const rutaAnterior = process.env.DB_HOST + ':' + process.env.APP_PORT + '/' + pregunta.material_apoyo;
                    console.log(rutaAnterior);
                    
                    if(fs.existsSync(rutaAnterior)) {
                        fs.unlinkSync(rutaAnterior);
                    }
                } */
            }

            const query = await preguntaQueries.update(id, datos);
            if (query.ok) {
                console.log('Se logró actualizar la pregunta: ' + id);
                return res.status(200).json({ ok: true, data: query.data });
            } else {
                return res.status(404).json({ ok: false, data: null, message: 'Pregunta no actualizada.' });
            }
        } catch (error) {
            console.error(error);
            
            return res.status(500).json({ ok: false, data: null, message: 'Error en el servidor' });
        }
    }

    async findPreguntasExamen(req, res){
        try {
            const body = req.body;
            const query = await preguntaQueries.findPreguntasExamen(body);
            if(query.ok){
                return res.status(200).json({ ok: true, data: query.data});
            } else {
                return res.status(400).json({ ok: false, data: null, message: 'Examen no encontrado o no tiene permiso de contestarlo.'});
            }
        } catch (error) {
            console.error(error);
            return res.status(403).json({ ok: false, data: null, message: 'Hubo un problema en el servidor.'});
        }
    }
}
export const preguntaController = new PreguntaController();