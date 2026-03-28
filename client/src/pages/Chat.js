import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import ChatBox from "../components/ChatBox";
import RelationshipBar from "../components/RelationshipBar";
import { saveChatData, loadChatData } from "../utils/localStorageHelper";
import "./Chat.css";

function Chat() {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [relationship, setRelationship] = useState({ affection: 0, trust: 0, intimacy: 0, anger: 0 });
  const [relationshipLevel, setRelationshipLevel] = useState({ level: "Stranger", emoji: "👋" });
  const [chatId, setChatId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  const fetchChatData = useCallback(async () => {
    try {
      const charId = id;
      
      const charRes = await API.get(`/character/${charId}`);
      setCharacter(charRes.data);

      const createRes = await API.post("/chat/create", {
        characterId: charId,
        mode: "romantic",
      });
      
      const createdChatId = createRes.data.chatId;
      setChatId(createdChatId);

      // Load chat (THIS generates intro)
      const chatRes = await API.get(`/chat/${createdChatId}`);
      const { messages: history, relationship: relData, level, emoji } = chatRes.data;
      
      // Load from localStorage if available, fallback to history from API
      const storedMessages = loadChatData(createdChatId, "messages", history);
      setMessages(storedMessages || []);

      const storedRel = loadChatData(createdChatId, "relationship", relData);
      if (storedRel) setRelationship(storedRel);

      if (level) setRelationshipLevel({ level, emoji });

      setLoading(false);
    } catch (err) {
      console.error("Error loading chat data:", err);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChatData();
  }, [fetchChatData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Persist messages to localStorage
  useEffect(() => {
    if (chatId && messages.length > 0) {
      saveChatData(chatId, "messages", messages);
    }
  }, [messages, chatId]);

  // Persist relationship to localStorage
  useEffect(() => {
    if (chatId) {
      saveChatData(chatId, "relationship", relationship);
    }
  }, [relationship, chatId]);

  const regenerateLastMessage = async () => {
    if (!chatId) return;
    
    try {
      setTyping(true);
      
      // Remove last AI message locally for better UX
      setMessages(prev => {
        if (prev.length > 0 && prev[prev.length - 1].sender === "ai") {
          return prev.slice(0, -1);
        }
        return prev;
      });

      const res = await API.post(`/chat/regenerate/${chatId}`);
      
      setTyping(false);
      
      setMessages(prev => [
        ...prev,
        { sender: "ai", text: res.data.reply }
      ]);

      if (res.data.relationship) setRelationship(res.data.relationship);
      if (res.data.level) setRelationshipLevel({ level: res.data.level, emoji: res.data.emoji });
      if (res.data.emotion) setCharacter(prev => ({ ...prev, emotion: res.data.emotion }));
      
    } catch (err) {
      setTyping(false);
      console.error("Regeneration Error:", err);
    }
  };

  const sendMessage = async (isRegenerate = false) => {
    if (isRegenerate) {
      await regenerateLastMessage();
      return;
    }

    const textToSend = message;

    if (!textToSend?.trim()) return;

    try {
      const tempUserMsg = { sender: "user", text: textToSend };
      setMessages((prev) => [...prev, tempUserMsg]);
      setMessage("");

      setTyping(true);

      const res = await API.post("/chat/message", {
        chatId,
        message: textToSend,
      });

      setTyping(false);

      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: res.data.reply },
      ]);

      if (res.data.relationship) {
        setRelationship(res.data.relationship);
      }
      if (res.data.level) {
        setRelationshipLevel({ level: res.data.level, emoji: res.data.emoji });
      }
      if (res.data.emotion) {
        setCharacter(prev => ({ ...prev, emotion: res.data.emotion }));
      }
    } catch (err) {
      setTyping(false);
      console.error("AI Error:", err);
    }
  };

  if (loading) return <div className="loading">Initializing connection...</div>;

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        {character && (
          <div className="character-info">
            <div className="sidebar-avatar">{character.name.charAt(0)}</div>
            <h2>{character.name}</h2>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <p className="personality-badge">{character.personality}</p>
              {character.emotion && <p className="personality-badge mood" style={{backgroundColor: 'var(--tertiary-bg)'}}>Mood: {character.emotion}</p>}
            </div>
          </div>
        )}
        <div className="relationship-status-header" style={{ textAlign: 'center', marginBottom: '15px' }}>
          <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>
            Relationship: {relationshipLevel.level} {relationshipLevel.emoji}
          </h3>
        </div>
        <div className="relationship-stats">
          <RelationshipBar label="Affection" value={relationship.affection} />
          <RelationshipBar label="Trust" value={relationship.trust} />
          <RelationshipBar label="Intimacy" value={relationship.intimacy} />
          <RelationshipBar label="Anger" value={relationship.anger} />
        </div>
      </div>

      <div className="chat-main">
        <ChatBox
          messages={messages}
          message={message}
          setMessage={setMessage}
          onSend={() => sendMessage(false)}
          onRegenerate={() => sendMessage(true)}
          typing={typing}
          chatEndRef={chatEndRef}
          character={character}
        />
      </div>
    </div>
  );
}

export default Chat;
