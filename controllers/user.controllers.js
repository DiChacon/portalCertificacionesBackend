import jwt from 'jsonwebtoken';
import fs from 'fs';
import { UserQueries } from "../queries/user.query.js";
import { tokenMiddleware } from "../helpers/payload.js";
import { emailService, bodyEmailCreateUser, bodyEmailForgotPassword } from "../emailservice.js";
import ExcelHelper from "../helpers/excel.js";
import DataValidator from "../helpers/dataValidator.js";
import { bulkQueries } from "../queries/bulk.query.js";
import { UserModel } from '../models/user.model.js';
import { DatabaseConfig as sequelize } from "../config/database.js";


export class UserController {
  async create(req, res) {
    try {
      const body = req.body;

      // Llamar al método de consulta para crear el usuario
      const query = await UserQueries.store(body);

      if (query) {
        console.log(query);

        // Si el usuario se crea exitosamente, envía un correo
        // Se asume que en el body se envían: correo y username
        const { correo, nombre, username, id_usuario } = query.data.dataValues;

        const token = tokenMiddleware.createNewPassword(id_usuario);
        await UserQueries.updUser(id_usuario, { token: token });

        const link = `${process.env.FRONTEND_URL}/cambiar-contrasena?token=${token}`;

        //Mandar el correo para actualizar la contraseña de la nueva cuenta
        const emailResponse = await emailService.sendEmail(
          correo,
          '¡Bienvenido(a) a la Plataforma de Certificación STEM!',
          bodyEmailCreateUser(nombre, correo, link)
        );

        if (!emailResponse.ok) {
          console.error('Error al enviar el correo:', emailResponse.message);
        }

        return res.status(200).json({
          ok: true,
          data: query.data,
          message: 'Usuario creado y correo enviado.',
        });
      } else {
        return res.status(403).json({
          ok: false,
          message: 'No se pudo crear el usuario',
        });
      }
    } catch (error) {
      console.error('Error en create:', error);
      return res.status(400).json({
        ok: false,
        message: 'Hubo un problema en el servidor.',
      });
    }
  }

  async findOne(req, res) {
    try {
      const body = req.query;
      const query = await UserQueries.findOne(body);

      if (query.ok) {
        return res.status(200).json({ ok: true, data: query.data });
      } else {
        return res.status(403).json({ ok: false, message: 'No se pudo encontrar al usuario: ', condition });
      }
    } catch (error) {
      console.log('No se encontró el usuario.', error);
      return res.status(400).json({ ok: false, data: null });
    }
  }

  async authenticate(req, res, next) {
    // Este método es simplemente para decodificar el token y obtener los datos del usuario
    try {
      const token = req.cookies.token; // Obtener el token de las cookies

      if (!token) return res.status(401).json({ ok: false, message: 'Token no proporcionado' });

      const publicKey = fs.readFileSync(process.env.PUBLIC_KEY, "utf-8");

      const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'], clockTolerance: 60 }); // Verificar y decodificar el token

      if (!decoded) return res.status(401).json({ ok: false, message: 'Token inválido' });

      return res.status(200).json({ ok: true, message: 'Token autenticado correctamente', tkExp: decoded.exp, user: decoded });
    } catch (error) {
      console.error('Error al autenticar el token:', error);
      return res.status(500).json({ ok: false, message: 'Error en el servidor' });
    }
  }

  async login(req, res) {
    const { correo, password } = req.body;

    try {
      // Llama al método findOne pasando la condición del nombre de usuario
      const result = await UserQueries.findOne({ correo });

      // Verifica si el usuario fue encontrado
      if (!result.ok) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

      const user = result.data;

      // Usa el método validPassword para verificar la contraseña
      const isPasswordValid = await user.validPassword(password);

      // Si la contraseña no es válida, devuelve un mensaje de error
      if (!isPasswordValid) return res.status(401).json({ ok: false, message: 'Contraseña incorrecta' });

      //Cambiar el id_rol por el tipo de usuario.
      const MapeoDeRoles = {
        [process.env.ROL_ADMIN]: 'administrador',
        [process.env.ROL_PROFESOR]: 'maestro',
        [process.env.ROL_ALUMNO]: 'alumno',
        [process.env.ROL_ADMINSTITUCION]: 'adminstitucion'
      };
      // Busca el rol en el objeto. Si no lo encuentra, usa 'desconocido' como valor por defecto.
      const rol = MapeoDeRoles[user.id_rol] || 'desconocido';

      // Información que servira para el token y la petición
      const data = {
        id_usuario: user.id_usuario.toString(),
        username: user.username,
        nombre: user.nombre,
        app: user.app,
        apm: user.apm,
        correo: user.correo,
        id_institucion: user.id_institucion.toString(),
        carrera: user.carrera,
        id_rol: rol,
        nombre_inst: user.InstitucionModel.nombre_inst,
        logo_inst: user.InstitucionModel.logo_inst,
        estado: user.estado
      };

      const token = tokenMiddleware.createToken(data);

      res.cookie("token", token, {
        httpOnly: true, // Esto asegura que la cookie no sea accesible desde JavaScript del lado del cliente
        secure: process.env.MODE === 'dev', // Esto asegura que la cookie solo se envíe a través de HTTPS en producción /dev
        sameSite: "lax", // Esto ayuda a prevenir ataques CSRF
        maxAge: 24 * 60 * 60 * 1000, // 24 horas de duración del token
        path: "/", // Asegura que la cookie esté disponible en todo el sitio
        domain: process.env.DOMAIN
      });

      // Si la contraseña es válida, devuelve un mensaje de éxito
      return res.status(200).json({ ok: true, message: 'Inicio de sesión exitoso', data });

    } catch (error) {
      console.error('Error en el login:', error);
      return res.status(500).json({ ok: false, message: 'Error en el servidor' });
    }
  }
  async logout(req, res) {
    //Elimina la cookie de sesión (Debe ser exactamente igual a la cookie creada para que la encuentre)
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.MODE === 'dev',
      sameSite: "lax",
      path: "/",
      domain: process.env.DOMAIN
    });
    res.status(200).json({ mensaje: 'Sesión cerrada' });
  }

  async updUser(req, res) {
    try {
      const id = req.params.id;
      const datos = req.body;

      const query = await UserQueries.updUser(id, datos);
      if (query.ok) {
        console.log('Se logró actualizar el usuario: ' + id);
        return res.status(200).json({ ok: true, data: query.data });
      } else {
        return res.status(404).json({ ok: false, data: null, message: 'Usuario no encontrado' });
      }
    } catch (error) {
      return res.status(500).json({ ok: false, data: null, message: 'Error en el servidor backend', error });
    }
  }

  async findAll(req, res) {
    try {
      const condition = req.query;
      const query = await UserQueries.findAll(condition);

      if (query.ok) {
        const roles = {
          [process.env.ROL_ALUMNO]: 'alumno',
          [process.env.ROL_PROFESOR]: 'maestro',
          [process.env.ROL_ADMIN]: 'administrador'
        }
        for (let i = 0; i < query.data.length; i++) {
          query.data[i].id_rol = roles[query.data[i].id_rol]
        }
        return res.status(200).json({ ok: true, data: query.data });
      } else {
        console.log('No se pudieron obtener todos los usuarios.');
        return res.status(403).json({ ok: false, data: null, message: 'No se pudieron obtener todos los usuarios.' });
      }
    } catch (error) {
      console.error(error)
      return res.status(400).json({ ok: false, data: null, message: 'Hubo un error en el servidor.' })
    }
  }

  async newPwd(req, res) {
    try {
      const { password } = req.body;
      const userId = req.user.user_id;


      if (!password) {
        return res.status(400).json({ ok: false, message: 'La nueva contraseña es requerida.' });
      }

      const updatePassword = await UserQueries.updUser(userId, { password: password, token: null });

      if (!updatePassword.ok) {
        return res.status(500).json({ ok: false, message: 'No se pudo actualizar la contraseña.' });
      }

      return res.status(200).json({ ok: true, message: 'Contraseña actualizada correctamente.' });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ ok: false, message: 'Error en el servidor.' });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { correo } = req.body;

      // Verificamos si existe el correo en nuestra BD
      const user = await UserQueries.findOne({ correo });

      if (!user) {
        return res.status(404).json({ ok: false, message: 'Correo no registrado en nuestra BD' });
      }

      // Creamos un nuevo token y lo guardamos en la BD
      const token = tokenMiddleware.createNewPassword(user.data.id_usuario);

      await UserQueries.updUser(user.data.id_usuario, { token });

      // Generamos el link que se enviará por correo al usuario
      const link = `${process.env.FRONT_URL}/cambiar-contrasena?token=${token}`;

      // Enviamos el correo
      const emailResponse = await emailService.sendEmail(
        correo,
        'Solicitud de cambio de contraseña',
        bodyEmailForgotPassword(user.data.nombre, link)
      );

      if (!emailResponse.ok) {
        return res.status(500).json({ ok: false, message: 'Hubo un problema al enviar el correo.' });
      }

      return res.status(200).json({ ok: true, message: 'Correo de recuperación enviado.' });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ ok: false, message: 'Error en el servidor.' });
    }
  }

  async bulkUsers(req, res) {
  const t = await sequelize.transaction();

  try {
    const { id_institucion, id_creador } = req.body;

    // 1. Validaciones Iniciales
    if (!id_institucion || !id_creador || !req.file) {
      return res.status(400).json({ message: 'Faltan datos requeridos: id_institucion, id_creador o archivo.' });
    }

    // 2. Lectura y Validación del Archivo Excel
    const buffer = req.file.buffer;
    const excelData = await ExcelHelper.readOneSheet(buffer);
    const validation = DataValidator.validateUsers(excelData);
    if (!validation.validated) {
      return res.status(400).json({ message: 'Datos inválidos en el archivo Excel.', errors: validation.errors });
    }

    // Prepara los datos iniciales de los usuarios del excel.
    const usersDataFromExcel = excelData.map(user => ({
      nombre: user.nombre,
      app: user.app,
      apm: user.apm,
      correo: user.correo,
      id_institucion,
      id_rol: 4543, // Rol de estudiante por defecto
    }));

    // 3. Filtrado de Usuarios Duplicados (que ya existen en la BD)
    const filteredUsers = await DataValidator.notDuplicatedUsers(usersDataFromExcel);
    if (filteredUsers.totalUniqueUsers === 0) {
      return res.status(200).json({ message: 'Todos los usuarios del documento ya existen en la base de datos.', duplicatedUsers: filteredUsers.duplicates });
    }

    // 4. Registro del Bulk en la Base de Datos (dentro de la transacción)
    const bulkData = {
      id_creator: id_creador,
      count_users: filteredUsers.totalUniqueUsers,
      id_institucion: id_institucion
    };
    // Se pasa el objeto de transacción 't' a la consulta.
    const bulkQuery = await bulkQueries.store(bulkData, { transaction: t });
    if (!bulkQuery.ok) {
      // Si falla, lanzamos un error para que la transacción se revierta.
      throw new Error('Error al registrar el bulk en la base de datos.');
    }
    const idBulk = bulkQuery.data.id_bulk;
    for (const user of filteredUsers.uniqueUsers) {
      let intentos = 0;
      let idGenerado;
      let idAsignado = false;

      while (intentos < 10) {
        idGenerado = DataValidator.getRandomNumericId(5); 
        const existe = await UserModel.findOne({ where: { id_usuario: idGenerado } });
        if (!existe) {
          user.id_usuario = idGenerado;
          idAsignado = true;
          break;
        }
        intentos++;
      }

      if (!idAsignado) {
        // Si no se pudo asignar un ID único, lanzamos un error para revertir todo.
        throw new Error('No se pudo generar un ID de usuario único. La operación se ha cancelado.');
      }
      user.id_bulk = idBulk; // Asigna el id del bulk a cada usuario único.
    }

    // 5. Inserción de los Nuevos Usuarios en la Base de Datos
    // Ahora insertamos solo los usuarios únicos, que ya tienen su ID y id_bulk asignados.
    const query = await UserQueries.bulkUsers(filteredUsers.uniqueUsers, { transaction: t });
    if (!query.ok) {
      throw new Error('Error al insertar los usuarios en la base de datos.');
    }

    // 6. Envío de Correos (después de la inserción)
    for (const user of filteredUsers.uniqueUsers) {
      const token = tokenMiddleware.createNewPassword(user.id_usuario);
      
      // Actualiza el token del usuario (dentro de la transacción)
     const resultado = await UserQueries.updUser(user.id_usuario, { token: token }, { transaction: t });
     console.log('Resultado de la actualización del token para el usuario:', resultado);
      
      const link = `${process.env.FRONT_URL}/cambiar-contrasena?token=${token}`;
      
      // El envío de correos puede quedar fuera de la transacción si se prefiere,
      // pero aquí lo mantenemos dentro para asegurar que todo el proceso es atómico.
      const emailResponse = await emailService.sendEmail(
        user.correo,
        '¡Bienvenido(a) a la Plataforma de Certificación STEM!',
        bodyEmailCreateUser(user.nombre, user.correo, link)
      );
      if (!emailResponse.ok) {
        // Si un email falla, podríamos decidir si revertir todo o solo registrar el error.
        // Aquí lanzamos un error para ser consistentes.
        throw new Error(`Error al enviar el correo al usuario: ${user.correo}`);
      }
    }
    await t.commit();
    const data_inserted_users = filteredUsers.uniqueUsers.map(({ id_institucion, id_rol, id_bulk, ...rest }) => rest);

    // 7. Respuesta de Éxito
    return res.status(200).json({
      message: 'Inserción de usuarios correcta.',
      data: {
        id_bulk: idBulk,
        inserted_users: data_inserted_users,
        count_inserted_users: filteredUsers.totalUniqueUsers,
        duplicated_users: filteredUsers.duplicates
      }
    });

  } catch (error) {
    // --- CORRECCIÓN: Si algo falló, se revierte la transacción ---
    await t.rollback();
    
    console.error('Error en bulkUsers:', error);
    return res.status(500).json({ message: error.message || 'Error en el servidor.' });
  }
  }
}

export const userController = new UserController();