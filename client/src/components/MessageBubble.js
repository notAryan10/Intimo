import React, { useState } from 'react';
import './MessageBubble.css';
import { parseMessage } from '../utils/messageFormatter';
import API from '../services/api';

let currentAudio = null;

async function speak(text, characterId, messageId, setSpeakingId) {
  if (!text || !characterId || !messageId) return;
  
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    setSpeakingId(messageId);
    
    const response = await API.post("/chat/tts", 
      { text, characterId }, 
      { responseType: 'blob' }
    );

    const audioUrl = URL.createObjectURL(response.data);

    currentAudio = new Audio(audioUrl);
    
    currentAudio.onended = () => {
      setSpeakingId(null);
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
    };
    
    currentAudio.onerror = () => {
      setSpeakingId(null);
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
    };

    await currentAudio.play();
  } catch (err) {
    console.error("TTS Error:", err);
    setSpeakingId(null);
  }
}

function FormattedMessage({ text, sender }) {
  if (!text) return null;

  const segments = parseMessage(text, sender);

  return (
    <div className="formatted-message">
      {segments.map((segment, index) => {
        const className = segment.type; 
        return (
          <span key={index} className={className}> {segment.content} </span>
        );
      })}
    </div>
  );
}

function MessageBubble({ sender, text, messageId, characterName, characterId, voiceSettings, emotion }) {
  const isUser = sender === "user";
  const [speakingId, setSpeakingId] = useState(null);

  const isSpeaking = speakingId === messageId;

  return (
    <div className={`message-container ${isUser ? 'user' : 'ai'}`}>
      <div className={`message-bubble ${isUser ? 'user' : 'ai'}`}>
        <FormattedMessage text={text} sender={sender} />
        
        {!isUser && (
          <button 
            className={`tts-button ${isSpeaking ? 'speaking' : ''}`} 
            onClick={() => speak(text, characterId, messageId, setSpeakingId)} 
            disabled={isSpeaking} 
            title={isSpeaking ? "Speaking..." : "Listen"} 
          >
            {isSpeaking ? "⏳" : "🔊"}
          </button>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
