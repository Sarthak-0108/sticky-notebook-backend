import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Google Gemini Setup
console.log(process.env.GEMINI_API_KEY);
const gemini_API_forHindi = new GoogleGenAI(process.env.GEMINI_API_KEY);
const gemini_API_forEnglish = new GoogleGenAI(
  process.env.GEMINI_API_KEY_ENGLISH
);

// Route
app.post("/gemini-note", async (req, res) => {
  // return res.status(403).json({ error: "Gemini quota exceeded" });
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await gemini_API_forHindi.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    res.json({ text: response.text });

    console.log(response);
    console.log(response.text);
  } catch (error) {
    console.error("Error generating content:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/gemini-englishNote", async (req, res) => {
  // return res.status(403).json({ error: "Gemini quota exceeded" });
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await gemini_API_forEnglish.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    res.json({ text: response.text });

    console.log(response);
    console.log(response.text);
  } catch (error) {
    console.error("Error generating content:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const COHERE_API_KEY = process.env.COHERE_API_KEY;
app.post("/generate-note", async (req, res) => {
  const { prompt } = req.body;

  try {
    const cohereResponse = await fetch("https://api.cohere.ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COHERE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "command-r-plus",
        prompt: prompt,
        max_tokens: 50,
        temperature: 0.2,
      }),
    });

    const data = await cohereResponse.json();

    if (data && data.text) {
      res.json({ text: data.text.trim() });
    } else if (data.message) {
      res.status(400).json({ error: data.message });
    } else {
      res.status(500).json({ error: "Unexpected response format", raw: data });
    }
  } catch (error) {
    console.error("Error connecting to Cohere:", error);
    res.status(500).json({ error: "Server error while contacting Cohere." });
  }
});
app.get("/", (req, res) => {
  res.send("🛠️ AI Note Backend is running.");
});
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 AI Note Backend running on http://localhost:${PORT}`)
);
