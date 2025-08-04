import express from 'express';
import routes from './routes/index.js';
import cron from 'node-cron';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 6000;


// Middleware para usar JSON (opcional)
app.use(express.json());

cron.schedule('0 0,8,16 * * *', async () => { // Horários de atualização de preços. A cada hora aos 5 minutos.
    try {
        await axios.get(`http://localhost:${PORT}/api/update-offers`);
    } catch (error) {
        console.error('Erro ao chamar o endpoint:', error);
    }
}, {
    scheduled: true,
    timezone: 'America/Sao_Paulo'
});


// Usa as rotas importadas

app.use('/api', routes);
app.get('/', (req, res) => {
    res.send('Api kinguin online.');
});

export default app;