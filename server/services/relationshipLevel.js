function getRelationshipLevel(relationship) {
  const { affection, intimacy, trust, anger } = relationship;

  if (anger > 60) return { level: "Conflict", emoji: "💔" };

  if (intimacy >= 85) return { level: "Lover", emoji: "❤️" };
  if (intimacy >= 70) return { level: "Romantic", emoji: "💕" };
  if (affection >= 60) return { level: "Crush", emoji: "😍" };
  if (trust >= 50) return { level: "Close Friend", emoji: "🤝" };
  if (affection >= 30) return { level: "Friend", emoji: "🙂" };
  
  return { level: "Stranger", emoji: "👋" };
}

module.exports = { getRelationshipLevel };
