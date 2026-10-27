const express = require("express");
const Review = require("../models/reviewModel");
const SearchLog = require("../models/searchModel");
const Tour = require("../models/tourModel");
const authMiddleware = require("../middlewares/authMiddleware");
const ai = require("../config/gemini"); // GoogleGenAI instance
require("dotenv").config();

function parseGeminiJSON(text) {
  try {
    // Remove ```json ... ``` if present
    const cleaned = text.replace(/```json\s*([\s\S]*?)```/, "$1").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Error parsing Gemini JSON:", err);
    return { error: "Invalid JSON from Gemini", raw: text };
  }
}

// ------------------- Analysis Functions -------------------
async function analyzeReviews(reviews) {
  if (!reviews.length) return { message: "No reviews found" };

  const reviewTexts = reviews
    .map((r) => `• ${r.review} (Rating: ${r.rating})`)
    .join("\n");
  const prompt = `
You are an analytics assistant for a travel platform. 
Analyze these tour reviews and return **strict JSON** in the following format:
{
  "summary": "A short factual summary of overall user feedback",
  "positives": ["List only concrete positive aspects mentioned by users"],
  "negatives": ["List only concrete negative aspects mentioned by users"]
}

Instructions:
- Only extract **specific facts** from the reviews.
- Do not create generic or vague statements.
- Include multiple points if mentioned.
- Do not add your own opinions.

Reviews:
${reviewTexts}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // Remove ```json ... ``` if Gemini wraps it in Markdown
    const cleaned = response.text
      .replace(/```json\s*([\s\S]*?)```/, "$1")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini Review Analysis Error:", err);
    return { error: "Failed to analyze reviews", details: err.message || err };
  }
}

async function analyzeSearches(searches) {
  if (!searches.length) return { message: "No searches found" };

  const searchList = searches
    .map((s) => `• ${s.query} (Frequency: ${s.frequency})`)
    .join("\n");

  const prompt = `
You are an analytics assistant for a travel platform. 
Analyze the following user search queries and return **strict JSON** in the format:

{
  "insight_summary": "Brief overview of search behavior",
  "informative_searches": ["List of searches that are specific and useful"],
  "non_informative_searches": ["List of vague or unclear searches"],
  "sorted_by_frequency": [
    {"query": "search query", "frequency": number}
  ]
}

Instructions:
- Categorize searches into informative and non-informative.
- Include frequency for each search in the sorted list.
- Sort the sorted_by_frequency list from most to least frequent.
- Use only facts from the search data. Do not create imaginary searches.

Search Queries:
${searchList}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return parseGeminiJSON(response.text);
  } catch (err) {
    console.error("Gemini Search Analysis Error:", err);
    return { error: "Failed to analyze searches", details: err.message || err };
  }
}

// ------------------- Express Router -------------------

const router = express.Router();

router.get(
  "/overview",
  authMiddleware.protect,
  authMiddleware.restrictTo("admin", "owner"),
  async (req, res) => {
    try {
      const filter = {};
      if (req.query.tourId) {
        filter.tour = req.query.tourId;
      }
      if (req.query.startDate || req.query.endDate) {
        filter.createdAt = {};
        if (req.query.startDate)
          filter.createdAt.$gte = new Date(req.query.startDate);
        if (req.query.endDate)
          filter.createdAt.$lte = new Date(req.query.endDate);
      }
      const reviews = await Review.find(filter).lean();

      const searches = await SearchLog.find().limit(100).lean();

      const [reviewAnalysis, searchAnalysis] = await Promise.all([
        analyzeReviews(reviews),
        analyzeSearches(searches),
      ]);

      res.json({
        success: true,
        reviewAnalysis,
        searchAnalysis,
      });
    } catch (error) {
      console.error("Analytics Error:", error);
      res.status(500).json({
        success: false,
        message: "Error generating analytics",
        error: error.message || error,
      });
    }
  }
);

router.get(
  "/analytic-tours",
  authMiddleware.protect,
  authMiddleware.restrictTo("admin", "owner"),
  async (req, res) => {
    try {
      const tours = await Tour.find({})
        .select("_id title ")
        .sort({ createdAt: -1 })
        .lean();

      res.json({
        success: true,
        count: tours.length,
        data: tours,
      });
    } catch (error) {
      console.error("❌ Error fetching tours:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch tours list",
      });
    }
  }
);

module.exports = router;
