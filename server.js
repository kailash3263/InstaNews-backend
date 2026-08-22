require("dotenv").config();
const express = require("express");
const cors = require("cors");
const newsRoutes = require("./routes/newsRoutes");

const connectDB = require('./config/db');
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api", newsRoutes);

app.use((req, res) => {
  res.status(404).send("went wrong. Route not found.");
}); 


async function connectMongo(){
     try {
        await connectDB();
    } catch (error) {
        console.error("MongoDB connection failed:", error);
    } 
}
connectMongo()


app.listen(process.env.PORT,async () => {
    console.log(`Server running http://localhost:${process.env.PORT}`);
});
// console.log("Mongo URL exists:", !!process.env.mongoUrl);
// console.log("Mongo URL:", process.env.mongoUrl?.replace(/\/\/.*?:.*?@/, "//***:***@"));