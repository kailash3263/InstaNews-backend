const cheerio = require("cheerio");
const { GoogleGenAI } = require("@google/genai");
const axios = require("axios");
const cron = require("node-cron");
const {Article, SavedArticle} = require("../models/articles");
const fetchNewsWithRotation = require("../utils/fetchWithKeyRotation");
const searchHistory = require("../models/searchHistory");

cron.schedule("0 0 * * *", async () => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const result = await Article.deleteMany({
      savedAt: { $lt: oneWeekAgo }
    });

  } catch (error) {
    console.error("Cleanup failed:", error);
  }
});
// let page = -1;
// cron.schedule("*/5 * * * *", async () => {
//   const data = await fetchNewsWithRotation(
//     (key) =>
//       `https://newsdata.io/api/1/latest?apikey=${key}&country=in&language=en&image=1&${(page==-1)?"":("page="+page.toString())}`,
//   );
//   // newsData = [...data.results, ...newsData];		
//   page = data.nextPage;
//   await Article.insertMany(
//     (data.results).map((article) => ({
//       title: article.title,
//       image_url: article.image_url, 
//       link: article.link,
//       publishedAt: article.pubDate,
//       source: article.source_name,
//     })),   
//   );
// });

exports.getNewsByDate = async (req, res) => {
  const { date } = req.params; // e.g. "2026-08-23"

  try {
    const start = new Date(`${date}T00:00:00.000+05:30`);
    const end = new Date(`${date}T23:59:59.999+05:30`);

    const articles = await Article.find({
      createdAt: {
        $gte: start,
        $lte: end
      }
    });

    res.json({articles, count:articles.length});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
exports.searchNews = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { q } = req.query;
    // console.log(q);
    const data1 = await fetchNewsWithRotation(
      (key) =>
        `https://newsdata.io/api/1/latest?apikey=${key}&country=in&language=en&image=1&q=${encodeURIComponent(q)}`,
    );
    const data2 = await fetchNewsWithRotation(
      (key) =>
        `https://newsdata.io/api/1/latest?apikey=${key}&country=in&language=en&image=1&q=${encodeURIComponent(q)}&page = ${data1.nextPage}`,
    );
    const data3 = await fetchNewsWithRotation(
      (key) =>
        `https://newsdata.io/api/1/latest?apikey=${key}&country=in&language=en&image=1&q=${encodeURIComponent(q)}&page = ${data2.nextPage}`,
    );
    const articles = [...data1.results,...data2.results,...data3.results];
    res.json({articles,count:articles.length});

    await searchHistory.create({userId:userId,keyword:q})  

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNewsByCategory = async (req, res) => {
  try {
    //  console.log(q)
    const { category } = req.params;
    const data1 = await fetchNewsWithRotation(
      (key) =>
        `https://newsdata.io/api/1/latest?apikey=${key}&country=in&language=en&image=1&category=${encodeURIComponent(category)}`,
    );
    const data2 = await fetchNewsWithRotation(
      (key) =>
        `https://newsdata.io/api/1/latest?apikey=${key}&country=in&language=en&image=1&category=${encodeURIComponent(category)}&page = ${data1.nextPage}`,
    );
    const data3 = await fetchNewsWithRotation(
      (key) =>
        `https://newsdata.io/api/1/latest?apikey=${key}&country=in&language=en&image=1&category=${encodeURIComponent(category)}&page = ${data2.nextPage}`,
    );
    const articles = [...data1.results,...data2.results,...data3.results];
    res.json({articles,count:articles.length});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.scrapeUrl = async (req, res) => {
  try {
    const { url } = req.body;
    const { newsTitle } = req.body;
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    const $ = cheerio.load(data);
    // Crucial Step: Strip out code tags completely
    $("script, style, noscript, iframe").remove();

    // Extract clean body text
    const cleanText = $("body").text().trim().replace(/\s+/g, " ");
    //  console.log(cleanText);
    const prompt = `Title: ${newsTitle} The following text was extracted from a news website and may contain unrelated sections like ads, navigation links, or promotional lines.
    Ignore all irrelevant content and summarize only the part that relates to the actual news based on the given title. Focus on extracting the core news information — what happened, where, when, and who was involved.
    Be concise and ignore any unrelated phrases or web content and expalin in very simple and easy way in just 150 words.  Start your answer directly explaining the content.
    Text extracted from website: ${cleanText}`;
    const ai = new GoogleGenAI({ apiKey: `${process.env.geminiKey}` });
    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: prompt,
    });
    let explanation = interaction.output_text;
    res.json({ explanation });
    // console.log(interaction.output_text);
  } catch (error) {
    console.error("Extraction failed:", error.message);
  }
};
