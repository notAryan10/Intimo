const express = require("express");
const router = express.Router();
const Character = require("../models/Character");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { name, personality, emotion, description, visibility } = req.body;

    const character = new Character({
      userId: req.userId,
      name,
      personality,
      emotion,
      description,
      visibility
    });

    await character.save();
    res.json(character);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/my", authMiddleware, async (req, res) => {
  const characters = await Character.find({ userId: req.userId });
  res.json(characters);
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const character = await Character.findOne({ _id: req.params.id, userId: req.userId });
    if (!character) return res.status(404).json({ error: "Character not found" });
    res.json(character);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const Chat = require("../models/Chat");
const Message = require("../models/Message");
const Memory = require("../models/Memory");
const Relationship = require("../models/Relationship");

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const characterId = req.params.id;
    const userId = req.userId;

    await Character.deleteOne({ _id: characterId, userId });

    const chats = await Chat.find({ characterId, userId });
    const chatIds = chats.map(chat => chat._id);

    await Chat.deleteMany({ characterId, userId });
    await Message.deleteMany({ chatId: { $in: chatIds } });

    await Memory.deleteMany({ characterId, userId });

    await Relationship.deleteMany({ characterId, userId });

    res.json({ message: "Character and all related data deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
