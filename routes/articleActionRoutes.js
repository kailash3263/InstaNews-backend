const express = require("express");
const router = express.Router();

const {
  toggleLike,
  toggleBookmark,
  getLikedArticles,
  getBookmarkedArticles,
  getSearchHistory,
  deleteSearchHistory,
  deleteBookmarkArticle,
  deleteLikedArticle
} = require("../controllers/articleActionController");

const authController = require("../controllers/authController");
router.post("/like", authController.authenticate, toggleLike);
router.post("/bookmark", authController.authenticate, toggleBookmark);
router.get("/liked", authController.authenticate, getLikedArticles);
router.get("/bookmarked", authController.authenticate, getBookmarkedArticles);
router.get("/search-history", authController.authenticate, getSearchHistory);
router.delete("/search-history/:id", authController.authenticate, deleteSearchHistory);
router.delete("/delete-liked-article/:id", authController.authenticate,deleteLikedArticle);
router.delete("/delete-bookmarked-article/:id",authController.authenticate, deleteBookmarkArticle);



// router.post("/save-history",authController.authenticate, saveSearchHistory);

module.exports = router; 