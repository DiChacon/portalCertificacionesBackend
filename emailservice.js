import nodemailer from 'nodemailer';



export const bodyEmailCreateUser = (nombre, correo, link) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
    <h2 style="color: #2c3e50;">¡Bienvenido(a) a la Plataforma de Certificación STEM!</h2>

    <p>Hola <strong>${nombre}</strong>,</p>

    <p>Nos alegra darte la bienvenida a nuestra plataforma. A continuación, te compartimos la información necesaria para que puedas acceder por primera vez:</p>

    <p><strong>🔐 Correo con el que te registraste:</strong> <code>${correo}</code></p>

    <p>Para completar tu registro, es necesario que establezcas una contraseña. Solo debes hacer clic en el siguiente botón y seguir las instrucciones:</p>

    <p style="text-align: center;">
      <a href="${link}" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Establecer contraseña
      </a>
    </p>

    <p>Este enlace es único para ti y estará activo por tiempo limitado, así que te recomendamos activarlo cuanto antes.</p>

    <p>Una vez que hayas establecido tu contraseña, podrás acceder a la plataforma con tu correo y la nueva contraseña que hayas creado en https://stem-certificaciones.com/login</p>

    <hr style="margin: 30px 0;">

    <p>📘 ¿Necesitas ayuda para usar la plataforma? Consulta nuestro manual oficial aquí:</p>

    <p>
      <a href="https://drive.google.com/file/d/1G7ZY9x0Lt-jyrxGdHjpS-B8SSC3-_dbg/view?usp=drive_link" style="color: #3498db;">
        Ver Manual de Usuario
      </a>
    </p>
    <p>
      <a href="https://drive.google.com/file/d/1PpBAV2eCDgg9yjySncZlTtzoYq18cbc0/view?usp=drive_link" style="color: #3498db;">
        Ver Manual de Usuario - Maestro
      </a>
    </p>

    <p> Si tienes alguna pregunta o necesitas soporte técnico, no dudes en escribirnos a: <a href="mailto:soporte@stem-certificaciones.com">soporte@stem-certificaciones.com</a></p>

    <p>Gracias por formar parte de la comunidad STEM. ¡Mucho éxito en tus exámenes y proyectos!</p>

    <p style="color: #888;">— El equipo de la Plataforma de Certificación STEM</p>
  </div>
  `
}

export const bodyEmailCreateExam = (nombre, examen, fechaLimite, link) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
    <!-- Logo de la empresa -->

    <h2 style="color: #2c3e50;">Hola ${nombre}</h2>

    <p>Te informamos que se te ha asignado un nuevo examen: <strong>${examen}</strong>.</p>

    <p>Detalles del examen:</p>
    <ul>
      <li><strong>Examen:</strong> ${examen}</li>
      <li><strong>Fecha límite:</strong> ${fechaLimite}</li>
    </ul>

    <p>Para acceder al examen, haz clic en el siguiente botón:</p>

    <p style="text-align: center;">
      <a href="https://stem-certificaciones.com/login" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Entrar a las instancias del examen
      </a>
    </p>
    
    <p>Recuerda que debes completar el examen antes de la fecha límite indicada.</p>

    <p>Si tienes alguna duda o necesitas más información, no dudes en contactarnos.</p>

    <hr style="margin: 30px 0;">

    <p>📧 Si tienes alguna pregunta o necesitas soporte técnico, no dudes en escribirnos a: <a href="mailto:soporte@stem-certificaciones.com">soporte@stem-certificaciones.com</a></p>

    <p>Gracias por formar parte de la comunidad STEM. ¡Mucho éxito en tus exámenes y proyectos!</p>

    <p style="color: #888;">— El equipo de la Plataforma de Certificación STEM</p>
  </div>
  `
}

export const bodyEmailForgotPassword = (nombre, link) => {
  return `<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restablecer Contraseña</title>
        <style>
            body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f7f6; }
            .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
            .email-body { padding: 30px 40px; color: #333333; line-height: 1.6; font-size: 16px; }
            .cta-button { display: inline-block; background-color: #0B5CB5; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; }
            .email-footer { padding: 20px 40px; font-size: 12px; color: #888888; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0; }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-body">
                <h2 style="color: #0A52A3; margin-top: 0;">Hola ${nombre},</h2>
                <p>Hemos recibido una solicitud para restablecer tu contraseña. Si has sido tú, por favor haz clic en el siguiente botón para crear una nueva:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${link}" class="cta-button">
                        Crear Nueva Contraseña
                    </a>
                </div>
                <p>Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura. Tu cuenta permanecerá sin cambios.</p>
                <p>Gracias,<br>El equipo de la Plataforma de Certificación STEM.</p>
            </div>
            <div class="email-footer">
                Este es un correo electrónico automático, por favor no respondas a este mensaje.
            </div>
        </div>
    </body>
    </html>`
};

export const emailService = {
  async sendEmail(to, subject, html) {
    try {
      const user = process.env.EMAIL_HOST_USER;
      const pass = process.env.EMAIL_HOST_PASSWORD;
      const host = process.env.EMAIL_HOST;
      const port = Number(process.env.EMAIL_PORT);

      console.log('Enviando correo con:', { host, port, user, pass });

      const transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: port === 465, // true para 465, false para 587
        auth: { user, pass },
      });

      const mailOptions = { from: user, to, subject, html };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Correo enviado: ${info.response}`);

      return { ok: true, message: 'Correo enviado exitosamente' };
    } catch (error) {
      console.error('Error al enviar correo:', error.message, error.stack);
      return { ok: false, message: 'Error al enviar correo', error };
    }
  },
};
