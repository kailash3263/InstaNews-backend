const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

const authController = require("../controllers/authController");

router.get('/news/date/:date', newsController.getNewsByDate);
router.get('/news/search',authController.authenticate ,newsController.searchNews);
router.get('/news/category/:category',authController.authenticate , newsController.getNewsByCategory);
router.post('/scrape',authController.authenticate , newsController.scrapeUrl);

module.exports = router;