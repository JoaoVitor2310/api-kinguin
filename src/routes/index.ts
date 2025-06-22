// src/routes/index.ts
import { Router } from 'express';
import updateOffersRoute from './updateOffers.js';

const router = Router();

router.use(updateOffersRoute); // Rota de atualização de ofertas

export default router;
