const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  characterId: mongoose.Schema.Types.ObjectId,
  chatMode: {
    type: String,
    enum: ["safe", "romantic", "nsfw"],
    default: "safe"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  greetingGenerated: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Chat", ChatSchema);
