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

// Cron para checar se algum jogo já pode ser listado
cron.schedule('0 8,18 * * *', async () => { // Horários: 8h e 18h
    try {
        await axios.get(`${process.env.THIS_URL}/api/when-to-sell`);
    } catch (error) {
        console.error('Erro ao chamar o endpoint when-to-sell:', error);
    }
}, {
    scheduled: true,
    timezone: 'America/Sao_Paulo'
});

// Cron para checar price 2
cron.schedule('* 7 * * *', async () => { // Horários: 7h
    try {
        await axios.get(`${process.env.THIS_URL}/api/priceWholesale`);
    } catch (error) {
        console.error('Erro ao chamar o endpoint priceWholesale:', error);
    }
}, {
    scheduled: true,
    timezone: 'America/Sao_Paulo'
});

// Usa as rotas importadas

app.use('/api', routes);
app.get('/', (req, res) => {
    res.send('Desenvolvido por João Vitor Matos Gouveia: https://www.linkedin.com/in/jo%C3%A3o-vitor-matos-gouveia-14b71437/');
});

export default app;