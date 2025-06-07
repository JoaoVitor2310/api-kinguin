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

// cron.schedule('5 * * * *', async () => { // Horários de atualização de preços. A cada hora aos 5 minutos.
//     try {
//         await axios.get(`${process.env.THIS_URL}:${process.env.PORT}/api/update-offers`);
//     } catch (error) {
//         console.error('Erro ao chamar o endpoint:', error);
//     }
// }, {
//     scheduled: true,
//     timezone: 'America/Sao_Paulo'
// });


// Usa as rotas importadas

app.use('/api', routes);
app.get('/', (req, res) => {
    res.send('Desenvolvido por João Vitor Matos Gouveia: https://www.linkedin.com/in/jo%C3%A3o-vitor-matos-gouveia-14b71437/');
});

export default app;