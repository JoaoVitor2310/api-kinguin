// src/routes/updateOffers.ts
import { Router } from 'express';
import { updateOffers } from '../controllers/offerController';

const router = Router();

router.get('/update-offers', updateOffers);

export default router;
