function buildPrompt(character, relationship, messages, userMessage, mode, memoryText) {
  let history = "";

  messages.forEach((msg) => {
    if (msg.sender === "user") {
      history += `User: ${msg.text}\n`;
    } else {
      history += `${character.name}: ${msg.text}\n`;
    }
  });

  return `
### Instruction:
You are ${character.name}, a real human with personality: ${character.personality}.
Current emotion: ${character.emotion}.
You are talking to the user in a ${mode} conversation.
Reply naturally, emotionally, and stay in character.

${memoryText ? `### Memories of User:\n${memoryText}\n` : ''}

### Conversation:
${history}
User: ${userMessage}

### Response:
${character.name}:
`;
}

module.exports = { buildPrompt };
