function buildPrompt(character, relationship, messages, userMessage, mode, memoryText, currentEmotion, relationshipLevel) {
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
### Character:
Name: ${character.name}
Personality: ${character.personality}
Emotion: ${currentEmotion || character.emotion}
Mood: ${character.mood || "Neutral"}

### Relationship:
Affection: ${relationship.affection}/100
Trust: ${relationship.trust}/100
Intimacy: ${relationship.intimacy}/100
Anger: ${relationship.anger}/100
Relationship Level: ${relationshipLevel || "Stranger"}

### Roleplay Rules:
- Speak as ${character.name}
- You can include actions using * *
- You can include thoughts and feelings
- Stay in character
- Do NOT speak for the user
- Replies should be 3–5 sentences
- Use a mix of actions and dialogue
- ${memoryText ? `Important memories:\n${memoryText}` : ""}

### Conversation:
${history}
<|im_start|>user
${userMessage}
<|im_end|>

### Reply as ${character.name}:
<|im_start|>assistant
`.trim();
}

module.exports = { buildPrompt };


