const express = require("express");
const router = express.Router();

const {
  GoogleGenerativeAI,
} = require("@google/generative-ai");

const genAI =
  new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
  );

router.post("/", async (req, res) => {
  try {
    const {
      prompt,
      code,
      language,
    } = req.body;

    const model =
      genAI.getGenerativeModel({
       model: "gemini-2.5-flash-lite",
      });

    const result =
      await model.generateContent(`
You are an expert coding assistant.

Language: ${language}

Code:
${code}

Question:
${prompt}
`);

    const response =
      result.response.text();

    res.json({
      response,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;