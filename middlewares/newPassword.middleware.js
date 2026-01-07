import fs from 'fs';
import jwt from 'jsonwebtoken';
import { UserQueries } from '../queries/user.query.js'; // Importa las consultas de usuario

export class validateNewPassword {
    static async validate(req, res, next) {
        try {
            const { token } = req.body;

            //Si no nos llega un token
            if (!token) {
                return res.status(400).json({ ok: false, message: 'Token es requerido' });
            }
            
            // Obtenemos la clave pública
            const publicKey = fs.readFileSync(process.env.PUBLIC_KEY, 'utf8');

            try {
                req.user = jwt.verify(token, publicKey); // Se asigna el resultado del token descifrado a req.user
                console.log("Payload: ", req.user);
                
                
            } catch (error) {
                return res.status(403).json({ ok: false, message: 'Token inválido o expirado.' });
            }
            
            // Buscar el usuario en la BD para verificar si el token sigue siendo válido
            const user = await UserQueries.findOne({ id_usuario: req.user.user_id });
            console.log("Respeta bro", user);
            

            if (!user || user.data.token !== token) {
                return res.status(403).json({ ok: false, message: 'Token inválido o ya utilizado.' });
            }
            next(); // Continúa con la siguiente función en la ruta

        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, message: 'Error en el servidor.' });
        }
    }
}
