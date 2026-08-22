const cheerio = require("cheerio");
const { GoogleGenAI } = require("@google/genai");
const axios = require("axios");
const cron = require("node-cron");
const Article = require("../models/articles");

let newsData = [];
const fetchNewsWithRotation = require("../utils/fetchWithKeyRotation");

cron.schedule("*/5 * * * *", async () => {
  const data = await fetchNewsWithRotation(
    (key) =>
      `https://newsdata.io/api/1/latest?apikey=${key}&country=in&language=en&image=1`,
  );
  newsData = [...data.results, ...newsData];		
  await Article.insertMany(
    (data.results).map((article) => ({
      title: article.title,
      imageUrl: article.image_url,
      link: article.link,
      publishedAt: new Date(article.pubDate),
      source: article.source_name,
    })),   
  );
});

exports.getNews = async (req, res) => {
  res.json(newsData);
};

exports.searchNews = async (req, res) => {
  try {
    const { q } = req.query;
    console.log(q);
    if (!q) return res.status(400).json({ error: "query param q required" });
    const data = await fetchNewsWithRotation(
      (key) =>
        `https://newsdata.io/api/1/latest?apikey=${key}&country=in&language=en&image=1&q=${encodeURIComponent(q)}`,
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNewsByCategory = async (req, res) => {
  try {
    //  console.log(q)
    const { category } = req.params;
    const data = await fetchNewsWithRotation(
      (key) =>
        `https://newsdata.io/api/1/latest?apikey=${key}&country=in&language=en&image=1&category=${encodeURIComponent(category)}`,
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.scrapeUrl = async (req, res) => {
  try {
    const { url } = req.body;
    const { newsTitle } = req.body;
    if (!url) return res.status(400).json({ error: "url required" });
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
    Be concise and ignore any unrelated phrases or web content and expalin in very simple and easy way in just 100 words.  Start your answer directly explaining the content.
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

exports.count = (req, res) => {
  res.json(newsData.length);
};
