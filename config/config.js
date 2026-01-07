import path from 'path';
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { Routes } from '../routes/routes.js';
import { Database } from './database.js';
import { Relaciones } from '../associations/associations.js';
import maintenanceMode from '../middlewares/maintenanceMode.middleware.js';

dotenv.config();
// Ejecuta la función para establecer las relaciones entre los modelos de la base de datos.
Relaciones();
class App {
    app = express.application;
    http = null;
    routes = new Routes();
    db = new Database();

    constructor() {
        this.initializeApp();
    }

    async initializeApp() {
        this.app = express();
        this.config();
        this.http = http.createServer(this.app);
        await this.initDatabase();
    }

    // Define el método donde se configuran los middlewares de la aplicación.
    config() {
        // Usa el middleware 'cookieParser' para poder leer las cookies de las peticiones.
        this.app.use(cookieParser());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());

        this.app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true,  allowedHeaders: ['Content-Type', 'authorization'] }));
        
        // Define una ruta estática para servir los archivos que se encuentran en la carpeta 'uploads'.
        this.app.use('/apicp/apicp/uploads', express.static(path.resolve('uploads')));
        
        // Aplica el middleware personalizado para gestionar el modo mantenimiento en todas las rutas.
        this.app.use(maintenanceMode);

        this.app.use('/apicp', this.routes.router);
    }

    // Define un método asíncrono para inicializar la conexión a la base de datos.
    async initDatabase() {
        const connection = await this.db.connection();
        console.log(connection.message);
    }
}

export default new App();