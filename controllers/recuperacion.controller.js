import { emailService } from "../emailservice.js";

export const recuperacionController = {
  async solicitarRecuperacion(req, res) {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({ ok: false, message: 'Debes ingresar un correo válido.' });
    }

    // 📌 Contenido del correo de recuperación
    const subject = 'Recuperación de Contraseña';
    const text = `Hola,

    Hemos recibido una solicitud para restablecer tu contraseña.
    
    Si no realizaste esta solicitud, ignora este correo.
    
    Para cambiar tu contraseña, visita el siguiente enlace:
    
    https://stem-certificaciones.com/cambiar-contrasena
    
    Si el enlace no funciona, copia y pega esta URL en tu navegador.
    
    Atentamente,  
    El equipo de soporte.`;

    const resultado = await emailService.sendEmail(correo, subject, text);

    return res.json(resultado);
  }
};
