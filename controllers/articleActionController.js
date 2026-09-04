const SearchHistory = require("../models/searchHistory");
const Like = require("../models/likes");
const Bookmark = require("../models/bookmark");
const { SavedArticle } = require("../models/articles");

const getOrCreateSavedArticle = async (article) => {
  let savedArticle = await SavedArticle.findOne({ link: article.link });

  if (!savedArticle) {
    savedArticle = await SavedArticle.create({ ...article });
  }
  console.log("article saved in SavedArticle collection")
  return savedArticle;
};

const toggleRelation = async ({ userId, article, relationModel, successMessage, removeMessage }) => {
  const savedArticle = await getOrCreateSavedArticle(article);
  const existingRelation = await relationModel.findOne({
    userId,
    articleId: savedArticle._id,
  });
  if (existingRelation) {
    await relationModel.deleteOne({ _id: existingRelation._id });
    return {
      active: false,
      message: removeMessage,
    };
  }
  await relationModel.create({
    userId,
    articleId: savedArticle._id,
  });
  console.log("article liked, saved in collection")
  return {
    active: true,
    message: successMessage,
  };
};

// Toggle Like
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.userId;
    const article = req.body.article;

    const result = await toggleRelation({
      userId,
      article,
      relationModel: Like,
      successMessage: "Article liked",
      removeMessage: "Article unliked",
    });
    
    return res.json({
      liked: result.active,
      message: result.message,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const userId = req.user.userId;
    const article = req.body.article;

    const result = await toggleRelation({
      userId,
      article,
      relationModel: Bookmark,
      successMessage: "Article bookmarked",
      removeMessage: "Article removed from bookmarks",
    });

    return res.json({
      bookmarked: result.active,
      message: result.message,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

exports.getLikedArticles = async (req, res) => {
  try {
    const userId = req.user.userId;
    const likes = await Like.find({ userId }).populate("articleId");

    const articles = likes.map((like) => like.articleId);
    res.json(articles);
  } catch (error) {
    console.error(error);
        console.log("liked article sent to frontend");
    res.status(500).json({
      message: "Failed to fetch liked articles",
    });
  }
};

exports.getBookmarkedArticles = async (req, res) => {
  try {
    const userId = req.user.userId;

    const bookmarks = await Bookmark.find({ userId }).populate("articleId");

    const articles = bookmarks.map((bookmark) => bookmark.articleId);
    console.log("bookmarked article sent to frontend");
    res.json(articles);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch bookmarked articles",
    });
  }
};

exports.getSearchHistory = async (req, res) => {
  try {
    const searches = await SearchHistory.find({
      userId: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .limit(20);

    console.log("search history sent to frontend");
    res.json(searches);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch search history",
    });
  }
};

exports.deleteSearchHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    await SearchHistory.deleteOne({
      _id: id,
      userId: req.user.userId,
    });
    
    console.log("search history deleted");
    res.json({
      message: "Search deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete search",
    });
  }
};

exports.deleteLikedArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    await Like.deleteOne({ articleId: id, userId: req.user.userId });
    console.log("liked article deleted");
    res.status(201).json({
      message: "Deleted",
    });
  } catch (error) {
    console.error("failed to delete:", error);

    res.status(500).json({
      message: "Failed to delete",
    });
  }
};

exports.deleteBookmarkArticle = async (req, res) => {
  try {
    const { id } = req.params;
    await Bookmark.deleteOne({ articleId: id });

    console.log("bookmark article deleted");
    res.status(201).json({
      message: "Deleted",
    });
  } catch (error) {
    console.error("failed to delete:", error);

    res.status(500).json({
      message: "Failed to delete",
    });
  }
};
