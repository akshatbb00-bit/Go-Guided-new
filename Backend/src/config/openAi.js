// config/openAi.js
const OpenAI = require("openai");
require("dotenv").config();

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = openAi;
