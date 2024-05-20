const router = require("express").Router();
const tetrisScoreController = require("../controllers/tetrisScore.controller");

// CREATE
router.post("/", tetrisScoreController.create);

// READ all scores
router.get("/list", tetrisScoreController.list);

// READ score by ID
router.get("/:tetrisScoreId", tetrisScoreController.detail);

// DELETE
router.delete("/:tetrisScoreId", tetrisScoreController.delete);

module.exports = router;
