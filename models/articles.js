const mongoose = require('mongoose');
const articleSchema = new mongoose.Schema({
  title: { type: String },
  imageUrl: { type: String },
  link: { type: String},
  publishedAt: { type: Date},
  source: { type: String}
});
module.exports = mongoose.model('Article', articleSchema);