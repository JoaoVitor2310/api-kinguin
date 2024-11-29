// src/routes/index.ts
import { Router } from 'express';
import updateOffersRoute from './updateOffers.js';
import priceResearcherRoute from './priceResearcher.js';
import whenToSellRoute from './whenToSell.js';

const router = Router();

router.use(updateOffersRoute); // Adiciona a rota de atualização de ofertas
router.use(priceResearcherRoute); // Adiciona a rota de buscador de preços
router.use(whenToSellRoute); // Adiciona a rota de quando vender

export default router;
