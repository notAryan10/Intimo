function formatMessage(text, characterName) {
  if (!text) return "";
  
  let formatted = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  formatted = formatted.replace(/\*?actions:\s*/gi, "*");

  let stars = (formatted.match(/\*/g) || []).length;
  if (stars % 2 !== 0) formatted += "*";

  formatted = formatted.replace(/\*(.*?)\*/g, "<i>$1</i>");

  const nameToMatch = characterName ? `|${characterName}` : "";
  const regex = new RegExp(`(^|\\.\\s+)(She|He|Her|His${nameToMatch})\\b([^.]*\\.)`, "g");
  formatted = formatted.replace(regex, '$1<i>$2$3</i>');

  return formatted;
}

function MessageBubble({ sender, text, characterName }) {
  const isUser = sender === "user";

  return (
    <div
      style={{display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", margin: "10px 0"}}>
      <div 
        style={{background: isUser ? "#2b8cff" : "#2f2f2f", color: "white", padding: "10px 15px", borderRadius: "15px", maxWidth: "60%", }}
        dangerouslySetInnerHTML={{ __html: formatMessage(text, characterName) }}
      />
    </div>
  );
}

export default MessageBubble;
