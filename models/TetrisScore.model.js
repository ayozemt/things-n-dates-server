const { Schema, model } = require("mongoose");

const tetrisScoreSchema = new Schema({
  userName: { type: String, required: true, trim: true, maxlength: 10 },
  score: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const TetrisScore = model("TetrisScore", tetrisScoreSchema);

module.exports = TetrisScore;
