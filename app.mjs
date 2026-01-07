import dotenv from 'dotenv';
dotenv.config();
console.log('DB_DIALECT:', process.env.DB_DIALECT);

import App from './config/config.js';
const host = process.env.APP_HOST


const port = process.env.APP_PORT || 8081;
App.http.listen(port, ()=>console.log(`API is running, port: ${port}`));


