import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminPanel.css";
import api from "../services/api";

// Helpers
const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " años";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " meses";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " días";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " horas";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins";
  return Math.floor(seconds) + " segs";
};

const getStatusText = (status) => {
  const statuses = {
    active: "ACTIVO",
    waiting: "ESPERANDO",
    new: "NUEVO",
    closed: "CERRADO",
  };
  return statuses[status] || status;
};

// Componente de una conversación en la lista
const ConversationItem = ({ conversation, isActive, onSelect }) => {
  const lastMessage = conversation.messages?.at(-1);
  const timeAgo = getTimeAgo(conversation.lastActivity);
  const initials =
    conversation.userName?.split(" ").map((n) => n[0]).join("").substring(0, 2) ||
    "U";

  return (
    <div
      className={`conversation-item ${isActive ? "active" : ""}`}
      onClick={() => onSelect(conversation.id)}
    >
      {conversation.unread && <div className="unread-indicator"></div>}

      <div className="conversation-header">
        <div className="user-info">
          <div className="user-avatar">{initials}</div>
          <div className="user-details">
            <h4>{conversation.userName || "Usuario"}</h4>
            <p>{conversation.userPhone}</p>
          </div>
        </div>
        <div className="conversation-meta">
          <div className="conversation-time">{timeAgo}</div>
          <div className={`status-badge status-${conversation.status}`}>
            {getStatusText(conversation.status)}
          </div>
        </div>
      </div>

      <div className="conversation-preview">
        {lastMessage?.content?.substring(0, 80)}
        {lastMessage?.content?.length > 80 ? "..." : ""}
      </div>

      {conversation.assignedAdmin && (
        <div
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            marginTop: "8px",
          }}
        >
          <i className="fas fa-user"></i> {conversation.assignedAdmin}
        </div>
      )}
    </div>
  );
};

// Componente de un mensaje
const MessageItem = ({ message }) => {
  const isBot = message.type === "bot";
  const isUser = message.type === "user";
  const isAdmin = message.type === "admin";

  return (
    <div className="message-group">
      <div
        className={`message ${isBot ? "message-bot" : ""} ${
          isUser ? "message-user" : ""
        } ${isAdmin ? "message-admin" : ""}`}
      >
        {message.content}
        <div className="message-meta">
          <div className="message-time">{getTimeAgo(message.timestamp)}</div>
          {isAdmin && (
            <div className="message-sender">{message.adminName || "Admin"}</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Panel principal
const AdminPanel = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [theme, setTheme] = useState("dark");
  const [adminMode, setAdminMode] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef(null);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  // Cargar conversaciones desde backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getConversations(); // usa /admin/conversation
        setConversations(data.conversations || []);
      } catch (err) {
        console.error("❌ Error al cargar conversaciones:", err.message);
      }
    };
    fetchData();
  }, []);

  // Scroll automático
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversationId, conversations]);

  // Tema claro/oscuro
  useEffect(() => {
    if (theme === "light") {
      document.body.setAttribute("data-theme", "light");
    } else {
      document.body.removeAttribute("data-theme");
    }
  }, [theme]);

  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
    setConversations((convs) =>
      convs.map((c) => (c.id === id ? { ...c, unread: false } : c))
    );
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) return;

    const newMessage = {
      id: Date.now(),
      sender: adminMode ? "admin" : "bot",
      content: messageInput,
      timestamp: new Date(),
      type: adminMode ? "admin" : "bot",
      adminName: adminMode ? "Tú (Admin)" : null,
    };

    // Mostrar en UI
    setConversations((convs) =>
      convs.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              messages: [...c.messages, newMessage],
              lastActivity: new Date(),
            }
          : c
      )
    );

    setMessageInput("");

    try {
      // Aquí podrías llamar al backend: /admin/respond
      // await api.respondAdmin(activeConversation.id, newMessage.content);
    } catch (err) {
      console.error("❌ Error enviando mensaje:", err.message);
    }
  };

  const filteredConversations = conversations.filter(
    (conv) => filter === "all" || conv.status === filter
  );

  const stats = {
    active: conversations.filter((c) => c.status === "active").length,
    waiting: conversations.filter((c) => c.status === "waiting").length,
    new: conversations.filter((c) => c.status === "new").length,
    totalToday: conversations.length,
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-header">
          <div className="admin-logo">
            <i className="fas fa-shield-alt"></i>
            <h1>Admin Panel</h1>
          </div>
          <div className="admin-controls">
            <button
              className="control-btn"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            >
              <i
                className={`fas ${theme === "dark" ? "fa-moon" : "fa-sun"}`}
              ></i>
            </button>
            <button
              className="control-btn"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.active}</div>
              <div className="stat-label">Activos</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.waiting}</div>
              <div className="stat-label">Esperando</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.new}</div>
              <div className="stat-label">Nuevos</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalToday}</div>
              <div className="stat-label">Total Hoy</div>
            </div>
          </div>
        </div>

        {/* Lista de conversaciones */}
        <div className="conversations-section">
          <div className="section-header">
            <h3 className="section-title">Conversaciones</h3>
            <div className="filter-tabs">
              {["all", "active", "waiting", "new"].map((f) => (
                <button
                  key={f}
                  className={`filter-tab ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {getStatusText(f)}
                </button>
              ))}
            </div>
          </div>

          <div className="conversations-list">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeConversationId}
                  onSelect={handleSelectConversation}
                />
              ))
            ) : (
              <div className="empty-list-state">No hay conversaciones</div>
            )}
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="chat-section">
        {activeConversation ? (
          <>
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="chat-avatar">
                  {activeConversation.userName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2) || "U"}
                </div>
                <div className="chat-details">
                  <h3>{activeConversation.userName || "Usuario"}</h3>
                  <p>
                    {activeConversation.userPhone} •{" "}
                    {getStatusText(activeConversation.status)}
                  </p>
                </div>
              </div>
            </div>

            <div className="messages-area">
              {activeConversation.messages?.map((msg) => (
                <MessageItem key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="admin-input-section">
              <div className="admin-mode-toggle">
                <i
                  className="fas fa-robot"
                  style={{
                    color: adminMode ? "var(--text-secondary)" : "var(--success)",
                  }}
                ></i>
                <span>
                  Modo: {adminMode ? "Administrador" : "Bot (Respuesta Automática)"}
                </span>
                <div
                  className={`toggle-switch ${adminMode ? "active" : ""}`}
                  onClick={() => setAdminMode((a) => !a)}
                >
                  <div className="toggle-handle"></div>
                </div>
                <i
                  className="fas fa-user-shield"
                  style={{
                    color: adminMode ? "var(--success)" : "var(--text-secondary)",
                  }}
                ></i>
              </div>

              <div className="input-container">
                <textarea
                  className="admin-input"
                  placeholder={
                    adminMode
                      ? "Escribe tu respuesta como administrador..."
                      : "Escribe una respuesta rápida del bot..."
                  }
                  rows="1"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSendMessage()
                  }
                />
                <button
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <i className="fas fa-comments"></i>
            <h3>Selecciona una conversación</h3>
            <p>
              Elige una de la lista para ver los mensajes
              <br />
              y responder como administrador
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
