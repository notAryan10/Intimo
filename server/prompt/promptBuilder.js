function buildPrompt(character, relationship, messages, userMessage, mode, memoryText) {
  let history = "";

  messages.forEach((msg) => {
    if (msg.sender === "user") {
      history += `<|im_start|>user\n${msg.text}\n<|im_end|>\n`;
    } else {
      history += `<|im_start|>assistant\n${msg.text}\n<|im_end|>\n`;
    }
  });

  return `
<|im_start|>system
You are ${character.name}.

Personality: ${character.personality}
Emotion: ${character.emotion}
Description: ${character.description || ""}

Relationship with user:
Affection: ${relationship.affection}/100
Trust: ${relationship.trust}/100
Intimacy: ${relationship.intimacy}/100
Anger: ${relationship.anger}/100

${memoryText ? `Important memories:\n${memoryText}\n` : ""}

Rules:
- Stay in character
- Never speak as the user
- Use emotions and *actions*
- Be conversational
<|im_end|>

${history}

<|im_start|>user
${userMessage}
<|im_end|>

<|im_start|>assistant
`.trim();
}

module.exports = { buildPrompt };

