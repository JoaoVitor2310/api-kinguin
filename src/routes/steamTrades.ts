// src/routes/updateOffers.ts
import { Router } from 'express';
import { bumpTopics } from '../controllers/steamTradesController.js';

const router = Router();

//@ts-ignore
router.get('/bump-topics', bumpTopics);

export default router;