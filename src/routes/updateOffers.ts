// src/routes/updateOffers.ts
import { Router } from 'express';
import { updateOffers } from '../controllers/offerController.js';

const router = Router();
// @ts-ignore
router.get('/update-offers', updateOffers);

export default router;