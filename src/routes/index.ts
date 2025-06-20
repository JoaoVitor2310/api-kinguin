// src/routes/index.ts
import { Router } from 'express';
import updateOffersRoute from './updateOffers.js';
import priceResearcherRoute from './priceResearcher.js';

const router = Router();

router.use(updateOffersRoute); // Adiciona a rota de atualização de ofertas
// router.use(priceResearcherRoute); // Adiciona a rota de buscador de preços

export default router;
