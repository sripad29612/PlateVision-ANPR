const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

router.post("/detect", upload.single("file"), async (req, res) => {
  try {

    const formData = new FormData();

    formData.append(
      "file",
      req.file.buffer,
      req.file.originalname
    );

    const response = await axios.post(
      "http://127.0.0.1:8000/detect",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    res.json(response.data);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Detection Failed",
    });

  }
});

module.exports = router;