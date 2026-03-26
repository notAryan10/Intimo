/**
 * Parses a message string into segments of narration, dialogue, and actions.
 * 
 * @param {string} text - The raw message text.
 * @param {string} sender - The sender ('user' or 'ai').
 * @returns {Array<{type: string, content: string}>} - An array of message segments.
 */
export const parseMessage = (text, sender = 'ai') => {
  if (!text) return [];

  const regex = /("[^"]*")|(\*[^*]*\*)/g;
  const parts = text.split(regex);
  
  return parts
    .filter(part => part !== undefined && part !== '')
    .map(part => {
      if (part.startsWith('"') && part.endsWith('"')) {
        return { type: 'dialogue', content: part };
      } else if (part.startsWith('*') && part.endsWith('*')) {
        return { type: 'action', content: part.slice(1, -1) };
      } else {
        const type = (sender === 'user') ? 'dialogue' : 'narration';
        return { type, content: part };
      }
    });
};

/**
 * Ensures that dialogue and narration are separated by line breaks for better UI layout.
 * This is used before rendering to group segments into cohesive blocks.
 * 
 * @param {string} text - The raw message text.
 * @returns {string} - The text with proper double newlines between different types.
 */
export const formatForUI = (text) => {
  if (!text) return "";

  let formatted = text
    .replace(/("[^"]*")(\s*)([^\s"])/g, '$1\n\n$3') 
    .replace(/([^\s"]\s*)("[^"]*")/g, '$1\n\n$2');

  return formatted.trim();
};
