const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String },
  image_url: { type: String },
  link: { type: String },
  publishedAt: { type: String },
  source: { type: String }
}, { timestamps: true });

const Article = mongoose.model('Article', articleSchema, 'articles');
const SavedArticle = mongoose.model('SavedArticle', articleSchema, 'savedArticles');

module.exports = Article;
module.exports.Article = Article;
module.exports.SavedArticle = SavedArticle;