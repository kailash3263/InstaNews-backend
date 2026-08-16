require('dotenv').config();
const express = require('express');
const cors = require('cors');
const newsRoutes = require('./routes/newsRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is running");
});


app.use('/api', newsRoutes);


app.use((req, res) => {
    res.status(404).send('went wrong. Route not found.');
});
app.listen(process.env.PORT, () => {
  console.log(`Server running http://localhost:${process.env.PORT}`);
});