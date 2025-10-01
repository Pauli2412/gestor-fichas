import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faMoon,
  faSun,
  faSearch,
  faComments,
  faRobot,
  faCircle,
  faPaperPlane,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "./chat.css";

// Componente para las burbujas de mensaje
const MessageBubble = ({ message }) => {
  const { content, sender, time } = message;

  const roleClass =
    sender === "user"
      ? "message-user"
      : sender === "admin"
      ? "message-admin"
      : "message-bot";

  return (
    <div className={`message ${roleClass}`}>
      {React.isValidElement(content) ? (
        content
      ) : typeof content === "string" && content.includes("<") ? (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>
      )}
      <div className="message-time">{time}</div>
    </div>
  );
};

const ChatUser = () => {
  const [theme, setTheme] = useState("dark");
  const [chatActive, setChatActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [inactivityTimer, setInactivityTimer] = useState(null);

  const messagesEndRef = useRef(null);

  const nowTime = () =>
    new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Scroll automático
  useEffect(() => {
    if (chatActive) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatActive]);

  // Detectar cambio de tamaño
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile && chatActive) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [chatActive]);

  // Timer de inactividad
  useEffect(() => {
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
  }, [inactivityTimer]);

  const resetInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    const t = setTimeout(() => {
      addMessage(
        "⏰ La conversación se cerró por inactividad. ¡Gracias por contactarnos!",
        "bot"
      );
      setChatActive(false);
      setUserPhone("");
      setSelectedPlatform(null);
    }, 5 * 60 * 1000);
    setInactivityTimer(t);
  };

  const addMessage = (content, sender) => {
    setMessages((prev) => [...prev, { content, sender, time: nowTime() }]);
    resetInactivityTimer();
  };

  // Inicializar chat
  const initializeChat = () => {
    if (!chatActive) {
      setChatActive(true);
      if (isMobile) setSidebarCollapsed(true);
      addMessage(
        "¡Hola! 👋 Soy tu asistente para gestionar fichas.<br>Por favor, ingresa tu número de teléfono para comenzar.",
        "bot"
      );
    }
  };

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  // Procesar mensaje del usuario
  const processUserMessage = async (message) => {
    setIsTyping(true);
    await new Promise((res) => setTimeout(res, 300));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_N8N_BASE_URL}/chat-user`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telefono: userPhone,
            mensaje: message,
            plataforma: selectedPlatform,
          }),
        }
      );

      const data = await response.json();

      if (data.reply) {
        addMessage(data.reply, data.rol || "bot");
      }

      if (data.options && Array.isArray(data.options)) {
        addMessage(
          <div className="action-buttons" style={{ marginTop: 6 }}>
            {data.options.map((opt, idx) => (
              <button
                key={idx}
                className="action-btn"
                onClick={() => {
                  if (data.action === "select_platform") {
                    setSelectedPlatform(opt);
                  }
                  addMessage(opt, "user");
                  processUserMessage(opt);
                }}
              >
                {opt}
              </button>
            ))}
          </div>,
          "bot"
        );
      }
    } catch (err) {
      console.error("Error llamando a chat-user:", err);
      addMessage(
        "⚠️ Hubo un error procesando tu mensaje. Intenta nuevamente.",
        "bot"
      );
    }

    setIsTyping(false);
  };

  // Enviar mensaje desde input
  const sendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;

    if (!userPhone) {
      // Primer mensaje debe ser teléfono
      setUserPhone(text);
    }

    addMessage(text, "user");
    processUserMessage(text);
    setInputValue("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className={`gestor-fichas ${theme} ${
        sidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
      data-theme={theme}
    >
      <div className="container-fluid h-100">
        <div className="row h-100">
          {/* Sidebar */}
          <div className={`sidebar p-0 ${sidebarCollapsed ? "collapsed" : ""}`}>
            <div className="sidebar-header">
              <div className="logo">
                <FontAwesomeIcon icon={faCoins} />
                {!sidebarCollapsed && <h1>Gestor de Fichas</h1>}
              </div>
              <div className="header-controls">
                <button
                  className="theme-toggle btn"
                  onClick={toggleTheme}
                  title={`Cambiar a modo ${
                    theme === "dark" ? "claro" : "oscuro"
                  }`}
                >
                  <FontAwesomeIcon icon={theme === "dark" ? faMoon : faSun} />
                </button>
                <button
                  className="sidebar-toggle btn"
                  onClick={toggleSidebar}
                  title={
                    sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"
                  }
                >
                  <FontAwesomeIcon icon={sidebarCollapsed ? faBars : faTimes} />
                </button>
              </div>
            </div>
            {!sidebarCollapsed && (
              <div className="search-container">
                <div className="search-box position-relative">
                  <FontAwesomeIcon icon={faSearch} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar o iniciar conversación"
                    onFocus={initializeChat}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="chat-area p-0 d-flex flex-column">
            {!chatActive ? (
              <div className="welcome-screen d-flex flex-column align-items-center justify-content-center text-center h-100">
                <FontAwesomeIcon icon={faComments} />
                <h2>Gestor de Fichas</h2>
                <p>Ingresa tu número de teléfono para comenzar</p>
                <button className="btn btn-primary mt-3" onClick={initializeChat}>
                  Iniciar Chat
                </button>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="chat-header">
                  {(sidebarCollapsed || isMobile) && (
                    <button
                      className="sidebar-toggle-mobile btn me-2"
                      onClick={toggleSidebar}
                      title="Mostrar sidebar"
                    >
                      <FontAwesomeIcon icon={faBars} />
                    </button>
                  )}
                  <div className="chat-avatar">
                    <FontAwesomeIcon icon={faRobot} />
                  </div>
                  <div className="chat-info">
                    <h3>Asistente de Fichas</h3>
                    <p className="status-indicator status-online mb-0">
                      <FontAwesomeIcon icon={faCircle} />
                      En línea
                    </p>
                  </div>
                </div>

                {/* Mensajes */}
                <div className="messages-container flex-grow-1">
                  {messages.map((message, i) => (
                    <MessageBubble key={i} message={message} />
                  ))}
                  {isTyping && (
                    <div className="typing-indicator d-flex align-items-center">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      Escribiendo...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="input-container">
                  <textarea
                    className="message-input flex-grow-1"
                    placeholder={
                      !userPhone
                        ? "Escribe tu número de teléfono..."
                        : "Escribe un mensaje..."
                    }
                    rows="1"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <button className="send-button" onClick={sendMessage}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatUser;
