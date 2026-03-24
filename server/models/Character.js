const mongoose = require("mongoose");

const CharacterSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  personality: String,
  emotion: String,
  description: String,
  visibility: {
    type: String,
    enum: ["private", "public"],
    default: "private"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Character", CharacterSchema);
