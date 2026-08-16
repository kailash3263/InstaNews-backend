const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

router.get('/news', newsController.getNews);
router.get('/news/count', newsController.count);
router.get('/news/search', newsController.searchNews);
router.get('/news/category/:category', newsController.getNewsByCategory);
router.post('/scrape', newsController.scrapeUrl);

module.exports = router;    