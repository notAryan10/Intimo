const mongoose = require("mongoose");

const MemorySchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  characterId: mongoose.Schema.Types.ObjectId,
  content: String,
  type: String, // personal, emotional, interest, event
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Memory", MemorySchema);
