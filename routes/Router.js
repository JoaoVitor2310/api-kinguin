const express = require('express');
const router = express();

router.use('/api/offers', require('./OffersRoutes'));
router.use('/api/products', require('./ProductsRoutes'));
router.use('/api/jobs', require('./JobsRoutes'));

module.exports = router;