const Message = require("../models/Message");

async function getLastMessages(chatId) {
  const messages = await Message.find({ chatId })
    .sort({ timestamp: -1 })
    .limit(4);

  return messages.reverse();
}

module.exports = { getLastMessages };
