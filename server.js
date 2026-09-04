require("dotenv").config();
const express = require("express");
const cors = require("cors");
const newsRoutes = require("./routes/newsRoutes");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const articleActionRoutes = require("./routes/articleActionRoutes");

const connectDB = require('./config/db');
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api", newsRoutes);
app.use("/auth", authRoutes);

app.use("/api/articles", articleActionRoutes);



app.use((req, res) => {
  res.status(404).send("went wrong. Route not found.");
}); 

async function connectMongo(){
     try {
        await connectDB();
        console.log("mongo db connected successfully")
    } catch (error) {
        console.error("MongoDB connection failed:", error);
    } 
}
connectMongo()


app.listen(process.env.PORT,async () => {
    console.log(`Server running on ${process.env.PORT}`);
});