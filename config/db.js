const mongoose = require('mongoose');
const connectDB = async () => {
  await mongoose.connect(process.env.mongoUrl);
};
module.exports = connectDB; 