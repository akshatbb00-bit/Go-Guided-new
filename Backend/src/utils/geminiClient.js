// One place to call Google Gemini. If a model has used up its free quota (429), is busy (503) or
// has been retired (404), the next model in the list is tried, so the chatbot, the trip planner and
// the analytics keep working. Set GEMINI_MODELS="modelA,modelB" to change the list.
const ai = require("../config/gemini");

const MODELS = (process.env.GEMINI_MODELS || "gemini-2.5-flash,gemini-flash-lite-latest,gemini-flash-latest")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const RETRY_ON = [404, 429, 500, 502, 503, 504];

const AI_BUSY_MESSAGE = "The AI assistant is busy or has reached its daily limit. Please try again in a little while.";

// request: { contents, config? } (no model). Returns the Gemini response (use response.text).
const generate = async (request) => {
  let last;
  for (const model of MODELS) {
    try {
      return await ai.models.generateContent({ model, ...request });
    } catch (err) {
      last = err;
      if (!RETRY_ON.includes(Number(err?.status))) throw err;
    }
  }
  const busy = new Error(AI_BUSY_MESSAGE);
  busy.aiBusy = true;
  busy.cause = last;
  throw busy;
};

module.exports = { generate, AI_BUSY_MESSAGE };
