export class HandleRol {
    static  RolToId(req, res, next) {
        try {
            //Asigna un el id_rol correspondiente.
            const MapeoDeRoles = {
                administrador: parseInt(process.env.ROL_ADMIN),
                maestro: parseInt(process.env.ROL_PROFESOR),
                alumno: parseInt(process.env.ROL_ALUMNO),
                adminstitucion: parseInt(process.env.ROL_ADMINSTITUCION)
            };

            //Verificar si en el query se recibe id_rol
            if (req.query && req.query.id_rol) {
                req.query.id_rol = MapeoDeRoles[req.query.id_rol];
            }
            
            //Verificar si en los parámetros se recibe id_rol
            if (req.body && req.body.id_rol) {
                req.body.id_rol = MapeoDeRoles[req.body.id_rol];
            }
            //Verificar si en el body se recibe id:rol
            if (req.params && req.params.id_rol) {
                req.params.id_rol = MapeoDeRoles[req.params.id_rol];
            }
            if (req.params && req.params.id_rol && req.params.id_rol === undefined && req.query && req.query.id_rol === undefined) {
                // Si el rol no existe en el mapa, rechaza la petición.
                return res.status(400).json({ ok: false, message: `El rol no es válido.` });
            }
            //Si es rol válido accede al recurso.
            next();
        } catch (error) {
            console.error(error);
            return res.status(403).json({ ok: false, message: 'Fallo en el parseo de rol.' });
        }
    }
}