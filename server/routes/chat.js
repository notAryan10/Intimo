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
const { getRelationshipLevel } = require("../services/relationshipLevel");
const axios = require("axios");
const Memory = require("../models/Memory");

async function generateGreeting(character) {
  try {
    const response = await axios.post("http://127.0.0.1:8000/generate-intro-scene", {
      character_name: character.name,
      personality: character.personality,
      emotion: character.emotion,
      description: character.description
    });
    return response.data.intro;
  } catch (err) {
    console.error("Error generating greeting:", err);
    return `*You see ${character.name} standing there.* "Hey there! I'm so glad we get to chat."`;
  }
}

async function generateReturnGreeting(character, relationship, memoryText, hoursAway) {
  return null;
}

router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { characterId, mode } = req.body;
    const userId = req.userId;

    let chat = await Chat.findOne({ userId, characterId });

    if (!chat) {
      chat = new Chat({
        userId,
        characterId,
        chatMode: mode || "romantic",
      });
      await chat.save();
    }

    const character = await Character.findById(characterId);

    const existingMessages = await Message.find({ chatId: chat._id });

    if (existingMessages.length === 0 && !chat.greetingGenerated) {
      const introMsg = await generateGreeting(character);
      await Message.create({
        chatId: chat._id,
        sender: "ai",
        text: introMsg
      });

      chat.greetingGenerated = true;
      chat.lastSeen = new Date();
      await chat.save();
    }

    // 4. Return full chat state
    const messages = await Message.find({ chatId: chat._id }).sort({ timestamp: 1 });
    const relationship = await Relationship.findOne({ userId, characterId });
    const levelInfo = relationship ? getRelationshipLevel(relationship) : { level: "Stranger", emoji: "👋" };

    res.json({
      chat,
      messages,
      relationship: relationship || { affection: 0, trust: 0, intimacy: 0, anger: 0 },
      level: levelInfo.level,
      emoji: levelInfo.emoji
    });
  } catch (err) {
    console.error("Error in /create:", err);
    res.status(500).json({ error: err.message });
  }
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

  // Get level BEFORE update
  const previousLevelInfo = getRelationshipLevel(relationship);

  // Relationship Decay (Every message)
  relationship.affection = Math.max(0, relationship.affection - 0.1);
  relationship.trust = Math.max(0, relationship.trust - 0.05);
  relationship.intimacy = Math.max(0, relationship.intimacy - 0.08);

  const analysis = await analyzeMessage(message);

  if (analysis) {
    if (analysis.affection !== undefined) relationship.affection += analysis.affection;
    if (analysis.trust !== undefined) relationship.trust += analysis.trust;
    if (analysis.intimacy !== undefined) relationship.intimacy += analysis.intimacy;
    if (analysis.anger !== undefined) relationship.anger += analysis.anger;
  }

  // Clamp values 0-100 & Always Save (for decay)
  relationship.affection = Math.max(0, Math.min(100, relationship.affection));
  relationship.trust = Math.max(0, Math.min(100, relationship.trust));
  relationship.intimacy = Math.max(0, Math.min(100, relationship.intimacy));
  relationship.anger = Math.max(0, Math.min(100, relationship.anger));

  await relationship.save();

  // Get level AFTER update
  const currentLevelInfo = getRelationshipLevel(relationship);
  
  // Detect Progression
  let levelChangeEvent = null;
  if (previousLevelInfo.level !== currentLevelInfo.level) {
    levelChangeEvent = `Relationship changed to ${currentLevelInfo.level}`;
  }

  if (analysis && analysis.emotion) {
    character.emotion = analysis.emotion;
    await character.save();
  }

   // Update dynamic emotion
  const currentEmotion = updateEmotion(relationship);
  character.emotion = currentEmotion;
  await character.save();

  // Relationship Events (Hardcoded thresholds)
  let specialEvent = null;
  const events = relationship.eventTriggered || new Map();

  if (relationship.intimacy > 80 && !events.get("confession")) {
    specialEvent = "confession";
    events.set("confession", true);
  } else if (relationship.affection > 60 && !events.get("likes_you")) {
    specialEvent = "likes_you";
    events.set("likes_you", true);
  } else if (relationship.anger > 60 && !events.get("fight")) {
    specialEvent = "fight";
    events.set("fight", true);
  }

  if (specialEvent) {
    relationship.eventTriggered = events;
    await relationship.save();
  }

  await Message.create({
    chatId,
    sender: "user",
    text: message,
  });

  chat.lastSeen = new Date();
  await chat.save();

  await extractAndStoreMemory(req.userId, character._id, message);

  const memories = await Memory.find({
    userId: req.userId,
    characterId: character._id,
  })
  .sort({ importance: -1, createdAt: -1 })
  .limit(5);

  let memoryText = "";
  memories.forEach(mem => {
    memoryText += `- ${mem.content} (Importance: ${mem.importance})\n`;
  });

  const messages = await getLastMessages(chatId);

  const promptContext = levelChangeEvent ? `${levelChangeEvent}. ${memoryText}` : memoryText;

  const prompt = buildPrompt(
    character,
    relationship,
    messages,
    message,
    chat.chatMode,
    promptContext,
    currentEmotion,
    currentLevelInfo.level
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
    level: currentLevelInfo.level,
    emoji: currentLevelInfo.emoji,
    emotion: currentEmotion,
    event: specialEvent || levelChangeEvent
  });
});

router.get("/:chatId", authMiddleware, async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  const character = await Character.findById(chat.characterId);
  const messages = await Message.find({ chatId: req.params.chatId });
  
  const relationship = await Relationship.findOne({
    userId: req.userId,
    characterId: chat.characterId,
  });

  const levelInfo = relationship ? getRelationshipLevel(relationship) : { level: "Stranger", emoji: "👋" };

  res.json({
    messages,
    relationship: relationship || { affection: 0, trust: 0, intimacy: 0, anger: 0 },
    level: levelInfo.level,
    emoji: levelInfo.emoji
  });
});

module.exports = router;
