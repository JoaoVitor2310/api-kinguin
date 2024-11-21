// src/routes/priceResearcher.ts
import { Router } from 'express';
import { whenToSell } from '../controllers/whenToSellController';

const router = Router();

router.get('/when-to-sell', whenToSell);

export default router;