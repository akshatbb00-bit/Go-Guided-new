// models/searchModel.js
const mongoose = require("mongoose");

const searchSchema = new mongoose.Schema({
  query: { type: String, required: true, unique: true },
  frequency: { type: Number, default: 1 },
});

const SearchLog = mongoose.model("SearchLog", searchSchema);
module.exports = SearchLog;
