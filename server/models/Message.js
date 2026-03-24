const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  chatId: mongoose.Schema.Types.ObjectId,
  sender: {
    type: String,
    enum: ["user", "ai"]
  },
  text: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Message", MessageSchema);
