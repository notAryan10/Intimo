const express = require("express");
const router = express.Router();
const Character = require("../models/Character");
const authMiddleware = require("../middleware/authMiddleware");

// Create Character
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

// Get My Characters
router.get("/my", authMiddleware, async (req, res) => {
  const characters = await Character.find({ userId: req.userId });
  res.json(characters);
});

// Delete Character
router.delete("/:id", authMiddleware, async (req, res) => {
  await Character.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ message: "Character deleted" });
});

module.exports = router;
