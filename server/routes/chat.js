const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const Character = require("../models/Character");
const Relationship = require("../models/Relationship");
const authMiddleware = require("../middleware/authMiddleware");

const { getAIResponse } = require("../services/aiService");
const { analyzeMessage } = require("../services/analyzerService");
const { extractAndStoreMemory } = require("../services/memoryService");
const { getLastMessages } = require("../memory/memoryManager");
const { buildPrompt } = require("../prompt/promptBuilder");
const Memory = require("../models/Memory");

router.post("/create", authMiddleware, async (req, res) => {
  const { characterId, mode } = req.body;

  const chat = new Chat({
    userId: req.userId,
    characterId,
    chatMode: mode,
  });

  await chat.save();
  res.json(chat);
});

router.post("/message", authMiddleware, async (req, res) => {
  const { chatId, message } = req.body;

  const chat = await Chat.findById(chatId);
  const character = await Character.findById(chat.characterId);

  let relationship = await Relationship.findOne({
    userId: req.userId,
    characterId: character._id,
  });

  if (!relationship) {
    relationship = new Relationship({
      userId: req.userId,
      characterId: character._id,
    });
    await relationship.save();
  }

  const analysis = await analyzeMessage(message);

  if (analysis) {
    relationship.affection += analysis.affection;
    relationship.trust += analysis.trust;
    relationship.intimacy += analysis.intimacy;
    relationship.anger += analysis.anger;

    await relationship.save();
  }

  await Message.create({
    chatId,
    sender: "user",
    text: message,
  });

  await extractAndStoreMemory(req.userId, character._id, message);

  const memories = await Memory.find({
    userId: req.userId,
    characterId: character._id,
  }).limit(5);

  let memoryText = "";
  memories.forEach(mem => {
    memoryText += `Memory: ${mem.content}\n`;
  });

  const messages = await getLastMessages(chatId);

  const prompt = buildPrompt(
    character,
    relationship,
    messages,
    message,
    chat.chatMode,
    memoryText
  );

  console.log("------ PROMPT START ------");
  console.log(prompt);
  console.log("------ PROMPT END ------");
  console.log("Calling AI...");

  const aiReply = await getAIResponse(prompt);

  await Message.create({
    chatId,
    sender: "ai",
    text: aiReply,
  });

  res.json({ reply: aiReply });
});

router.get("/:chatId", authMiddleware, async (req, res) => {
  const messages = await Message.find({ chatId: req.params.chatId });
  res.json(messages);
});

module.exports = router;
