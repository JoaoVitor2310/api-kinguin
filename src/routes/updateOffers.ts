// src/routes/updateOffers.ts
import { Router } from 'express';
import { updateOffers, updateSoldOffers } from '../controllers/offerController.js';

const router = Router();

router.get('/update-offers', updateOffers);
//@ts-ignore
router.get('/update-sold-offers', updateSoldOffers);

export default router;