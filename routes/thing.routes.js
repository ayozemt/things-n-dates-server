const router = require("express").Router();
const thingController = require("../controllers/thing.controller");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// CREATE
router.post("/", isAuthenticated, thingController.create);

// READ all things
router.get("/list", isAuthenticated, thingController.list);

// READ thing by ID
router.get("/:thingId", isAuthenticated, thingController.detail);

// READ things by user ID
router.get("/", isAuthenticated, thingController.listByUser);

// UPDATE
router.put("/:thingId", isAuthenticated, thingController.edit);

// DELETE
router.delete("/:thingId", isAuthenticated, thingController.delete);

module.exports = router;
