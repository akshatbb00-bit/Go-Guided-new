const express = require("express");
const router = express.Router();
const { generate, AI_BUSY_MESSAGE } = require("../utils/geminiClient");

// Models
const User = require("../models/userModel");
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const Review = require("../models/reviewModel");
const ChatSession = require("../models/chatSessionModel");
const authMiddleware = require("../middlewares/authMiddleware");

// POST /api/chat
// Body: { question }
router.post("/", authMiddleware.protect, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { question } = req.body;

    if (!question)
      return res.status(400).json({ error: "Question is required" });

    // 1️⃣ Fetch user data, bookings, tours, and reviews
    const [userData, bookings, tours, reviews] = await Promise.all([
      User.findById(userId).select("-password -isDeleted").lean(),
      Booking.find({ user: userId }).populate("tour").lean(),
      Tour.find().lean(),
      Review.find().populate("tour", "title").lean(),
    ]);

    // 2️⃣ Load or create chat session
    let session = await ChatSession.findOne({ user: userId });
    if (!session) {
      session = await ChatSession.create({ user: userId, history: [] });
    }

    // 3️⃣ Append user's question to history
    session.history.push({ role: "user", content: question });

    // 4️⃣ Static FAQs
    const faqs = [
      {
        question: "How to book a tour?",
        answer:
          "Select your desired tour, choose dates and participants, then proceed to payment.",
      },
      {
        question: "Can I cancel a booking?",
        answer:
          "Yes, you can cancel before the tour start date. Refund depends on our cancellation policy.",
      },
      {
        question: "How can I contact support?",
        answer: "Email us at support@goguided.com or call +91-XXXXXXXXXX.",
      },
    ];

    // 5️⃣ Prepare reviews context (keep it concise for Gemini)
    const reviewContext = reviews
      .map(
        (r) =>
          `Tour: ${r.tour?.title || "Unknown"} | Rating: ${r.rating} | "${
            r.review
          }"`
      )
      .join("\n");

    // 6️⃣ Build Gemini prompt
    const prompt = `
You are a helpful and friendly travel assistant for the Go-Guided website.

Use the following context to answer user questions accurately:

Static FAQs: ${JSON.stringify(faqs)}
User Data: ${JSON.stringify(userData)}
User Bookings: ${JSON.stringify(bookings)}
Available Tours: ${JSON.stringify(tours)}
Tour Reviews: 
${reviewContext}

Previous Chat History: ${JSON.stringify(session.history)}

Answer the following user question: "${question}"

Instructions:
- If the user asks about a tour, use "Available Tours" and "Tour Reviews" for information.
- If the user asks about their bookings, use "User Bookings".
- For general help, use FAQs.
- If not enough info is provided, politely say you don't have that data.
- Be concise, friendly, and factual.
`;

    // 7️⃣ Call Gemini
    const response = await generate({ contents: prompt });

    const answer = response.text.trim();

    // 8️⃣ Save to session
    session.history.push({ role: "assistant", content: answer });
    await session.save();

    res.json({ answer });
  } catch (err) {
    console.error("❌ Chat error:", err.aiBusy ? err.message : err);
    if (err.aiBusy) return res.status(503).json({ error: AI_BUSY_MESSAGE });
    res
      .status(500)
      .json({ error: "Something went wrong", details: err.message });
  }
});

module.exports = router;
