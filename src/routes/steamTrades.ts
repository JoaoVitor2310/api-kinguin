// src/routes/updateOffers.ts
import { Router } from 'express';
import { bumpTopics } from '../controllers/steamTradesController.js';

const router = Router();

router.get('/bump-topics', bumpTopics);
//@ts-ignore

export default router;