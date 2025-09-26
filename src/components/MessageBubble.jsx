import React from "react";

export default function MessageBubble({ message }) {
  return (
    <div className={`message message-${message.sender}`}>
      {typeof message.content === "string" ? (
        <span dangerouslySetInnerHTML={{ __html: message.content }} />
      ) : (
        message.content
      )}
      <div className="message-time">{message.time}</div>
    </div>
  );
}
