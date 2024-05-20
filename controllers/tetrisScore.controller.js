const TetrisScore = require("../models/TetrisScore.model");

module.exports.create = async (req, res, next) => {
  try {
    const { userName, score } = req.body;

    const tetrisScore = await TetrisScore.create({
      userName,
      score,
      date: new Date(),
    });

    const allScores = await TetrisScore.find().sort({ score: -1 });

    if (allScores.length > 10) {
      const scoresToDelete = allScores.slice(10);
      const deletePromises = scoresToDelete.map((score) =>
        TetrisScore.findByIdAndDelete(score._id)
      );
      await Promise.all(deletePromises);
    }

    return res.status(201).json(tetrisScore);
  } catch (error) {
    next(error);
  }
};

module.exports.list = async (req, res, next) => {
  try {
    const tetrisScores = await TetrisScore.find().sort({ score: -1 });

    return res.status(200).json(tetrisScores);
  } catch (error) {
    next(error);
  }
};

module.exports.detail = async (req, res, next) => {
  try {
    const { tetrisScoreId } = req.params;

    const tetrisScore = await TetrisScore.findById(tetrisScoreId);

    return res.status(200).json(tetrisScore);
  } catch (error) {
    next(error);
  }
};

module.exports.delete = async (req, res, next) => {
  try {
    const { tetrisScoreId } = req.params;

    await TetrisScore.findByIdAndDelete(tetrisScoreId);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
