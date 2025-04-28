import express from "express";
import dotenv from "dotenv";

dotenv.config();
import cors from "cors";
import axios from "axios";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const app = express();
const BOT_TOKEN = "7739208410:AAEkscciYQttsXZmhqNhAwmTZw6er4-rwiw";
const TELEGRAM_API=`https://api.telegram.org/bot${BOT_TOKEN}` // Your actual bot token

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.send("Bot is running");
});
let lastUpdateId = 0;
// Webhlet lastUpdateId = 0;ook endpoint (simplified without token in URL)
app.post('/webhook', async (req, res) => {
    try {
      const update = req.body;
      
      // Ignore old updates
      if (update.update_id <= lastUpdateId) {
        return res.send("OK");
      }
      
      lastUpdateId = update.update_id;
  
      if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text;
  
        if (text === "/start") {
          await sendMessage(chatId, "Welcome to my bot! 👋");
        } else if (text) {
            const {text: answer}=await generateText({
                model: google("gemini-2.0-flash-001", {GOOGLE_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY}),
                prompt: `You are now a telegram bot. You will receive a message from the user and you will respond to it. If asked who your creator is you say Biruk a software Engineer from ethiopia. The message is: ${text} `,
                
            })
          // Echo only new messages
          await sendMessage(chatId, `${answer}`);
        }
      }
  
      res.status(200).send("OK");
    } catch (error) {
      console.error("Error:", error);
      res.status(200).send("OK");
    }
  });
  
  async function sendMessage(chatId, text) {
    try {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: text
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});