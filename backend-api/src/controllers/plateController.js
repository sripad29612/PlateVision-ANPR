const Plate = require("../models/Plate");

const uploadPlate = async (req, res) => {
  try {
    const plate = await Plate.create({
      plateNumber: "TS09AB1234",

      confidence: 98.2,

      imageUrl: req.file?.path || "uploaded.jpg",
    });

    res.status(201).json(plate);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getPlates = async (req, res) => {
  try {
    const plates = await Plate.find().sort({
      createdAt: -1,
    });

    res.json(plates);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  uploadPlate,
  getPlates,
};