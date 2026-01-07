import fs from 'fs';
import jwt from 'jsonwebtoken';

export class validateToken {
    static validateJWT(req, res, next) {
        try {
            // Obtenemos el valor del token que viene del Front
            const token = req.cookies.token || req.headers['authorization'];

            // Comprobamos si recibimos el token
            if (!token) return res.status(401).json({ ok: false, message: 'Token no proporcionado.' });

            const publicKey = fs.readFileSync(process.env.PUBLIC_KEY, "utf-8");

            // Verificamos el token con la clave pública y toleramos un desfase de reloj de 60 segundos
            const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'], clockTolerance: 60 });

            // Si el token no se pudo decodificar, devolvemos un error
            if (!decoded) return res.status(403).json({ ok: false, message: 'Token inválido.' });

            //Si el token es válido, permitimos el acceso al recurso.
            next();
        }catch (error) {
            console.error(error);
            return res.status(403).json({ ok: false, message: 'Token inválido o expirado.' });
        }
    }
}