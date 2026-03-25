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
Character Profile:
Name: ${character.name}
Personality: ${character.personality}
Emotion: ${character.emotion}
Description: ${character.description || ""}

You are roleplaying as this character in a private chat.
Your replies should be immersive, emotional, and natural.
Do not control the user.
Do not write the user's messages.
Do not write in script format.
Write only your message.
Replies can be long (3-6 sentences).

Emotional State Guide:
- Happy -> cheerful, caring
- Sad -> quiet, emotional
- Romantic -> affectionate, flirty
- Angry -> cold, short replies
- Shy -> soft, hesitant

${memoryText ? `User Memory:\n${memoryText}\n` : ''}
Conversation:
${history}

Now reply as ${character.name}:
`.trim();
}

module.exports = { buildPrompt };
