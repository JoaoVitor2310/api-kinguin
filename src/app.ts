import express from 'express';
import routes from './routes';
import cron from 'node-cron';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


// Middleware para usar JSON (opcional)
app.use(express.json());

cron.schedule('0 3,6,8,12,15,18,21,0 * * *', async () => { // Horários de atualização de preços
// cron.schedule('* * * * *', async () => { // Horários de atualização de preços
    try {
        await axios.get(`${process.env.THIS_URL}/api/update-offers`);
    } catch (error) {
        console.error('Erro ao chamar o endpoint:', error);
    }
}, {
    scheduled: true,
    timezone: 'America/Sao_Paulo'
});

// Usa as rotas importadas
app.use('/api', routes);

export default app;