const mongoose = require("mongoose");

const plateSchema = new mongoose.Schema(
  {
    plateNumber: String,

    confidence: Number,

    imageUrl: String,

    detectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Plate",
  plateSchema
);