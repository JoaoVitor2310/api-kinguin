// src/routes/priceResearcher.ts
import { Router } from 'express';
import { priceResearcher } from '../controllers/priceResearcherController';

const router = Router();

router.get('/products/priceResearcher/:slug', priceResearcher);

export default router;