function MessageBubble({ sender, text }) {
  const isUser = sender === "user";

  return (
    <div
      style={{display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", margin: "10px 0"}}>
      <div style={{background: isUser ? "#2b8cff" : "#2f2f2f", color: "white", padding: "10px 15px", borderRadius: "15px", maxWidth: "60%", }}>
        {text}
      </div>
    </div>
  );
}

export default MessageBubble;
