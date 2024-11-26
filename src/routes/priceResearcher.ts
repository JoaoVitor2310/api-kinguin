// src/routes/priceResearcher.ts
import { Router } from 'express';
import { priceResearcher, priceWholesale } from '../controllers/priceResearcherController';

const router = Router();

router.get('/products/priceResearcher/:slug', priceResearcher);
router.get('/priceWholesale', priceWholesale);

export default router;