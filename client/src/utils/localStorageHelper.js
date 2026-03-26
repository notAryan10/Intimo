/**
 * Scoped localStorage helpers for character chats
 */

/**
 * Saves data to localStorage scoped by chatId
 * @param {string} chatId - Unique ID for the chat session
 * @param {string} key - Data category (e.g., 'messages', 'relationship')
 * @param {any} data - Data to persist
 */
export const saveChatData = (chatId, key, data) => {
  if (!chatId) return;
  const storageKey = `${key}_${chatId}`;
  localStorage.setItem(storageKey, JSON.stringify(data));
};

/**
 * Loads data from localStorage scoped by chatId
 * @param {string} chatId - Unique ID for the chat session
 * @param {string} key - Data category
 * @param {any} defaultValue - Fallback value if no data exists
 * @returns {any} Persisted data or defaultValue
 */
export const loadChatData = (chatId, key, defaultValue = null) => {
  if (!chatId) return defaultValue;
  const storageKey = `${key}_${chatId}`;
  const saved = localStorage.getItem(storageKey);
  try {
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error(`Error parsing localStorage key ${storageKey}`, e);
    return defaultValue;
  }
};

/**
 * Clears all chat-related data for a specific chatId
 * @param {string} chatId - Unique ID for the chat session
 */
export const clearChatData = (chatId) => {
  if (!chatId) return;
  
  const keysToClear = ['messages', 'relationship', 'memory', 'mood'];
  
  keysToClear.forEach(key => {
    localStorage.removeItem(`${key}_${chatId}`);
  });
  
  Object.keys(localStorage).forEach(key => {
    if (key.endsWith(`_${chatId}`)) {
      localStorage.removeItem(key);
    }
  });
};
