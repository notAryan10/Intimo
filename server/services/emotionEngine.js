function updateEmotion(relationship) {
  if (relationship.anger > 60) return "angry";
  if (relationship.intimacy > 70) return "romantic";
  if (relationship.trust > 70) return "open";
  if (relationship.affection > 70) return "caring";
  if (relationship.affection > 50 && relationship.intimacy > 50) return "loving";
  if (relationship.anger > 30) return "annoyed";
  if (relationship.affection < 20) return "distant";
  
  return "neutral";
}

module.exports = { updateEmotion };
