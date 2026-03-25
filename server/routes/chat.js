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
const { updateEmotion } = require("../services/emotionEngine");
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
    if (analysis.affection !== undefined) relationship.affection += analysis.affection;
    if (analysis.trust !== undefined) relationship.trust += analysis.trust;
    if (analysis.intimacy !== undefined) relationship.intimacy += analysis.intimacy;
    if (analysis.anger !== undefined) relationship.anger += analysis.anger;

    await relationship.save();

    if (analysis.emotion) {
      character.emotion = analysis.emotion;
      await character.save();
    }
  }

  const dynamicEmotion = updateEmotion(relationship);
  character.emotion = dynamicEmotion;
  await character.save();

  await Message.create({
    chatId,
    sender: "user",
    text: message,
  });

  await extractAndStoreMemory(req.userId, character._id, message);

  const allMemories = await Memory.find({
    userId: req.userId,
    characterId: character._id,
  }).sort({ createdAt: -1 }).limit(20);

  const keywords = message.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const relevantMemories = allMemories.filter(mem => 
    keywords.some(kw => mem.content.toLowerCase().includes(kw))
  );
  const types = ["personal", "interest", "emotional", "event"];
  const selectedMemories = [];
  
  selectedMemories.push(...relevantMemories.slice(0, 3));
  
  types.forEach(type => {
    if (selectedMemories.length < 6) {
      const typeMem = allMemories.find(m => m.type === type && !selectedMemories.includes(m));
      if (typeMem) selectedMemories.push(typeMem);
    }
  });

  let memoryText = "";
  selectedMemories.forEach(mem => {
    memoryText += `- ${mem.content} (${mem.type})\n`;
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

  const aiReply = await getAIResponse(prompt, character.name);

  await Message.create({
    chatId,
    sender: "ai",
    text: aiReply,
  });

  res.json({ 
    reply: aiReply,
    relationship: {
      affection: relationship.affection,
      trust: relationship.trust,
      intimacy: relationship.intimacy,
      anger: relationship.anger
    },
    emotion: character.emotion
  });
});

router.get("/:chatId", authMiddleware, async (req, res) => {
  const messages = await Message.find({ chatId: req.params.chatId });
  res.json(messages);
});

module.exports = router;
