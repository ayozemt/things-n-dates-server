const Thing = require("../models/Thing.model");

module.exports.create = async (req, res, next) => {
  try {
    const { type, name, date, review, place, rating } = req.body;
    const userId = req.payload._id;

    if (!type || !name || !date) {
      return res
        .status(400)
        .json({ message: "Bad request: type, name, date are mandatory" });
    }
    const thing = await Thing.create({
      type,
      name,
      date,
      review,
      place,
      rating,
      user: userId,
    });

    return res.status(201).json(thing);
  } catch (error) {
    next(error);
  }
};

module.exports.list = async (req, res, next) => {
  try {
    const things = await Thing.find();

    return res.status(200).json(things);
  } catch (error) {
    next(error);
  }
};

module.exports.listByUser = async (req, res, next) => {
  try {
    const userId = req.payload._id;

    const things = await Thing.find({ user: userId });

    if (!things) {
      return res.status(404).json({ message: "No things found for this user" });
    }

    return res.status(200).json(things);
  } catch (error) {
    next(error);
  }
};

module.exports.detail = async (req, res, next) => {
  try {
    const { thingId } = req.params;

    const thing = await Thing.findById(thingId);

    if (!thing) {
      return res.status(404).json({ message: "Thing not found" });
    }
    return res.status(200).json(thing);
  } catch (error) {
    next(error);
  }
};

module.exports.edit = async (req, res, next) => {
  try {
    const { thingId } = req.params;
    const { type, name, date, review, place, rating } = req.body;

    if (!type || !name || !date) {
      return res
        .status(400)
        .json({ message: "Bad request: type, name, date are mandatory" });
    }

    const updatedThing = await Thing.findByIdAndUpdate(
      thingId,
      { type, name, date, review, place, rating },
      { new: true }
    );

    if (!updatedThing) {
      return res.status(404).json({ message: "Thing not found" });
    }
    return res.status(200).json({ message: "Thing updated successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports.delete = async (req, res, next) => {
  try {
    const { thingId } = req.params;

    const deletedThing = await Thing.findByIdAndDelete(thingId);

    if (!deletedThing) {
      return res.status(404).json({ message: "Thing not found" });
    }
    return res.status(200).json({ message: "Thing deleted successfully" });
  } catch (error) {
    next(error);
  }
};
