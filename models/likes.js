const mongoose = require('mongoose');
const LikeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SavedArticle",
    required: true
  }
});
module.exports = mongoose.model("Like", LikeSchema);