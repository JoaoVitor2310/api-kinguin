// src/routes/index.ts
import { Router } from 'express';
import updateOffersRoute from './updateOffers';

const router = Router();

router.use(updateOffersRoute); // Adiciona a rota de atualização de ofertas

export default router;
