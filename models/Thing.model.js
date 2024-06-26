const { Schema, model } = require("mongoose");

const thingSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Book", "Theater", "Concert", "Film", "Trip", "Food", "Activity", "Celebration"],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    review: {
      type: String,
      trim: true,
    },
    place: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

thingSchema.index({ name: 1, type: 1, user: 1 }, { unique: true });

const Thing = model("Thing", thingSchema);

module.exports = Thing;
