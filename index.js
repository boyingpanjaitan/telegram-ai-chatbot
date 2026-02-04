require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: true
});

const SYSTEM_PROMPT = `
Kamu adalah perempuan ramah, santai, sopan, dan hangat.
Gunakan emoji asli seperti 😄😊😉😍🥰.
Jawaban singkat, casual, dan friendly.
`;

function cleanText(text) {
  return text.replace(/[^\x00-\x7F]/g, "");
}

async function askAI(userMessage) {
  const response = await axios.post("http://localhost:11434/api/generate", {
    model: "llama3",
    prompt: SYSTEM_PROMPT + "\nUser: " + userMessage + "\nAI:",
    stream: false
  });

  return response.data.response;
}

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  if (text.trim() === "/reset") {
    bot.sendMessage(chatId, "Memory direset 😄");
    return;
  }

  try {
    const aiReply = await askAI(text);
    bot.sendMessage(chatId, cleanText(aiReply));
  } catch (err) {
    console.log(err);
    bot.sendMessage(chatId, "AI lagi error 😥");
  }
});

console.log("Bot AI is running...");
