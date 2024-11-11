// src/app.ts
import express from 'express';
import routes from './routes';
import dotenv from 'dotenv';

const app = express();
const PORT = 3001;

dotenv.config();

// Middleware para usar JSON (opcional)
app.use(express.json());

// Usa as rotas importadas
app.use('/api', routes);

export default app;
