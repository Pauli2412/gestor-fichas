import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faUsers,
  faFileAlt,
  faCog,
  faSignOutAlt,
  faPaperPlane,
  faBars,
  faTimes,
  faSearch,
  faCircle,
  faEllipsisV,
  faPhone,
  faEnvelope,
  faCalendarAlt,
  faFilter,
  faRefresh
} from "@fortawesome/free-solid-svg-icons";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [activeMenu, setActiveMenu] = useState("conversations");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const [conversationSearch, setConversationSearch] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Estados para búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  // Estados para usuarios pendientes
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);

  // Estados para reclamos
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  // Auto-scroll al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Filtrar conversaciones por búsqueda
  const filteredConversations = conversations.filter(c =>
    (c.nombre || "").toLowerCase().includes(conversationSearch.toLowerCase()) ||
    c.telefono.includes(conversationSearch)
  );

  // Cargar conversaciones activas
  useEffect(() => {
    if (activeMenu === "conversations") {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/conversations`)
        .then((res) => res.json())
        .then((data) => setConversations(data.conversations || []))
        .catch((err) => console.error("Error cargando conversaciones:", err));
    }
  }, [activeMenu]);

  // Cargar historial cuando se selecciona una conversación
  useEffect(() => {
    if (selectedConversation) {
      fetch(`${import.meta.env.VITE_N8N_BASE}/chat-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefono: selectedConversation.telefono }),
      })
        .then((res) => res.json())
        .then((data) => setChatHistory(data.history || []))
        .catch((err) => console.error("Error cargando historial:", err));
    }
  }, [selectedConversation]);

  // Enviar respuesta del admin
  const handleSendAdminMessage = async () => {
    if (!adminMessage.trim() || !selectedConversation) return;

    setIsTyping(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_N8N_BASE}/admin/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telefono: selectedConversation.telefono,
            mensaje: adminMessage,
          }),
        }
      );

      if (!response.ok) throw new Error("Error enviando mensaje");

      // Guardar mensaje en UI inmediatamente
      const newMsg = {
        rol: "admin",
        contenido: adminMessage,
        createdAt: new Date().toISOString(),
      };

      setChatHistory((prev) => [...prev, newMsg]);
      setAdminMessage("");
    } catch (err) {
      console.error("Error enviando mensaje admin:", err);
      alert("No se pudo enviar el mensaje.");
    } finally {
      setIsTyping(false);
    }
  };

  // Buscar usuario
  const handleSearchUser = async () => {
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/search-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!res.ok) throw new Error("Error buscando usuario");
      const data = await res.json();

      if (!data.user) {
        alert("Usuario no encontrado");
        setSearchResult(null);
        setSearchHistory([]);
        return;
      }

      setSearchResult(data.user);

      const histRes = await fetch(`${import.meta.env.VITE_N8N_BASE}/chat-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefono: data.user.telefono }),
      });

      const histData = await histRes.json();
      setSearchHistory(histData.history || []);
    } catch (err) {
      console.error("Error en búsqueda:", err);
      alert("No se pudo buscar el usuario.");
    }
  };

  const fetchPendingUsers = async () => {
    setLoadingPending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/pending-users`);
      const data = await res.json();
      setPendingUsers(data.users || []);
    } catch (err) {
      console.error("Error cargando usuarios pendientes:", err);
      alert("No se pudieron cargar los usuarios pendientes.");
    } finally {
      setLoadingPending(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/approve-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Error aprobando usuario");
      alert("Usuario aprobado");
      fetchPendingUsers();
    } catch (err) {
      console.error(err);
      alert("No se pudo aprobar el usuario.");
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/reject-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Error rechazando usuario");
      alert("Usuario rechazado");
      fetchPendingUsers();
    } catch (err) {
      console.error(err);
      alert("No se pudo rechazar el usuario.");
    }
  };

  useEffect(() => {
    if (activeMenu === "pending-users") {
      fetchPendingUsers();
    }
  }, [activeMenu]);

  const fetchComplaints = async () => {
    setLoadingComplaints(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/complaints`);
      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Error cargando reclamos:", err);
      alert("No se pudieron cargar los reclamos.");
    } finally {
      setLoadingComplaints(false);
    }
  };

  const updateComplaintStatus = async (id, estado) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/complaints/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado }),
      });
      if (!res.ok) throw new Error("Error actualizando reclamo");
      alert(`Reclamo marcado como ${estado}`);
      fetchComplaints();
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el reclamo.");
    }
  };

  useEffect(() => {
    if (activeMenu === "complaints") {
      fetchComplaints();
    }
  }, [activeMenu]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Formatear timestamp más legible
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    
    if (diffInMinutes < 1) return "Ahora";
    if (diffInMinutes < 60) return `hace ${Math.floor(diffInMinutes)}m`;
    if (diffInMinutes < 1440) return `hace ${Math.floor(diffInMinutes / 60)}h`;
    
    return date.toLocaleDateString("es-AR", { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener último mensaje de conversación
  const getLastMessage = (conversation) => {
    // Aquí podrías obtener el último mensaje real de la conversación
    return "Último mensaje...";
  };

  // Refresh conversations
  const refreshConversations = () => {
    if (activeMenu === "conversations") {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/conversations`)
        .then((res) => res.json())
        .then((data) => setConversations(data.conversations || []))
        .catch((err) => console.error("Error cargando conversaciones:", err));
    }
  };

  return (
    <div className="admin-container">
      {/* Mobile Header */}
      <div className="mobile-header d-md-none">
        <button className="mobile-toggle" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </button>
        <h2>AdminPanel</h2>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="d-none d-md-block">AdminPanel</h2>
          <button className="close-btn d-md-none" onClick={closeSidebar}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="sidebar-content">
          <ul className="nav-menu">
            <li>
              <button
                className={`nav-link ${activeMenu === "conversations" ? "active" : ""}`}
                onClick={() => {
                  setActiveMenu("conversations");
                  closeSidebar();
                }}
              >
                <FontAwesomeIcon icon={faComments} className="nav-icon" />
                <span>Conversaciones</span>
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${activeMenu === "users" ? "active" : ""}`}
                onClick={() => {
                  setActiveMenu("users");
                  closeSidebar();
                }}
              >
                <FontAwesomeIcon icon={faUsers} className="nav-icon" />
                <span>Usuarios</span>
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${activeMenu === "pending-users" ? "active" : ""}`}
                onClick={() => {
                  setActiveMenu("pending-users");
                  closeSidebar();
                }}
              >
                <FontAwesomeIcon icon={faUsers} className="nav-icon" />
                <span>Usuarios Pendientes</span>
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${activeMenu === "complaints" ? "active" : ""}`}
                onClick={() => {
                  setActiveMenu("complaints");
                  closeSidebar();
                }}
              >
                <FontAwesomeIcon icon={faFileAlt} className="nav-icon" />
                <span>Reclamos</span>
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${activeMenu === "settings" ? "active" : ""}`}
                onClick={() => {
                  setActiveMenu("settings");
                  closeSidebar();
                }}
              >
                <FontAwesomeIcon icon={faCog} className="nav-icon" />
                <span>Configuración</span>
              </button>
            </li>
          </ul>

          <div className="sidebar-footer">
            <button className="logout-btn" href="/admin/login">
              <FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay d-md-none" onClick={closeSidebar}></div>}

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <h1>Panel de Administración</h1>
        </div>

        <div className="content-body">
          {activeMenu === "conversations" && (
            <div className="conversations-layout">
              {/* Lista de conversaciones mejorada */}
              <div className="conversations-list">
                <div className="conversations-header">
                  <div className="conversations-title">
                    <h4>Conversaciones activas</h4>
                    <span className="conversation-count">{conversations.length}</span>
                  </div>
                  <div className="conversations-actions">
                    <button className="refresh-btn" onClick={refreshConversations} title="Actualizar">
                      <FontAwesomeIcon icon={faRefresh} />
                    </button>
                  </div>
                </div>

                <div className="search-conversations">
                  <div className="search-input-wrapper">
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Buscar conversación..."
                      value={conversationSearch}
                      onChange={(e) => setConversationSearch(e.target.value)}
                      className="conversation-search-input"
                    />
                  </div>
                </div>

                <div className="conversation-items">
                  {filteredConversations.length === 0 ? (
                    <div className="no-conversations">
                      <p>No se encontraron conversaciones</p>
                    </div>
                  ) : (
                    filteredConversations.map((c, idx) => (
                      <div
                        key={idx}
                        className={`conversation-item ${
                          selectedConversation?.telefono === c.telefono ? "active" : ""
                        }`}
                        onClick={() => setSelectedConversation(c)}
                      >
                        <div className="conversation-avatar">
                          <div className="avatar-circle">
                            <span>{(c.nombre || "U").charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="status-indicator online">
                            <FontAwesomeIcon icon={faCircle} />
                          </div>
                        </div>
                        
                        <div className="conversation-info">
                          <div className="conversation-main">
                            <strong className="conversation-name">
                              {c.nombre || "Usuario"}
                            </strong>
                            <span className="conversation-time">
                              {formatMessageTime(c.lastMessageTime || new Date())}
                            </span>
                          </div>
                          <div className="conversation-details">
                            <span className="conversation-phone">
                              <FontAwesomeIcon icon={faPhone} />
                              {c.telefono}
                            </span>
                            {c.unreadCount > 0 && (
                              <span className="unread-badge">{c.unreadCount}</span>
                            )}
                          </div>
                          <p className="last-message">
                            {getLastMessage(c)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat mejorado */}
              <div className="chat-section">
                {selectedConversation ? (
                  <>
                    <div className="chat-header">
                      <div className="chat-user-info">
                        <div className="chat-avatar">
                          <div className="avatar-circle">
                            <span>{(selectedConversation.nombre || "U").charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="status-indicator online">
                            <FontAwesomeIcon icon={faCircle} />
                          </div>
                        </div>
                        <div className="chat-user-details">
                          <h4>{selectedConversation.nombre || "Usuario"}</h4>
                          <span className="user-phone">
                            <FontAwesomeIcon icon={faPhone} />
                            {selectedConversation.telefono}
                          </span>
                        </div>
                      </div>
                      <div className="chat-actions">
                        <button className="chat-action-btn" title="Más opciones">
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </button>
                      </div>
                    </div>

                    <div className="chat-messages">
                      {chatHistory.length === 0 ? (
                        <div className="no-messages">
                          <div className="no-messages-icon">
                            <FontAwesomeIcon icon={faComments} />
                          </div>
                          <p>No hay mensajes aún</p>
                          <small>Inicia la conversación enviando un mensaje</small>
                        </div>
                      ) : (
                        <>
                          {chatHistory.map((m, idx) => (
                            <div
                              key={idx}
                              className={`message-wrapper ${m.rol === "user" ? "user" : 
                                m.rol === "bot" ? "bot" : "admin"}`}
                            >
                              <div className="message-bubble">
                                <div className="message-content">{m.contenido}</div>
                                <div className="message-footer">
                                  <span className="message-time">
                                    {formatMessageTime(m.createdAt)}
                                  </span>
                                  {m.rol === "admin" && (
                                    <span className="message-status">
                                      <FontAwesomeIcon icon={faCircle} />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {isTyping && (
                            <div className="typing-indicator">
                              <div className="typing-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>
                              <small>Enviando...</small>
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </>
                      )}
                    </div>

                    <div className="chat-input">
                      <div className="input-wrapper">
                        <input
                          type="text"
                          className="message-input"
                          placeholder="Escribir mensaje..."
                          value={adminMessage}
                          onChange={(e) => setAdminMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendAdminMessage();
                            }
                          }}
                          disabled={isTyping}
                        />
                        <button 
                          className="send-btn" 
                          onClick={handleSendAdminMessage}
                          disabled={!adminMessage.trim() || isTyping}
                        >
                          <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="no-selection">
                    <div className="no-selection-icon">
                      <FontAwesomeIcon icon={faComments} />
                    </div>
                    <h3>Selecciona una conversación</h3>
                    <p>Elige una conversación de la lista para comenzar a chatear</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === "users" && (
            <div className="users-section">
              <h3 className="section-title">
                <FontAwesomeIcon icon={faUsers} />
                Usuarios
              </h3>
              <p className="section-description">Busca y gestiona usuarios del sistema</p>

              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar por nombre o teléfono..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchUser()}
                />
                <button className="search-btn" onClick={handleSearchUser}>
                  <FontAwesomeIcon icon={faSearch} />
                  Buscar
                </button>
              </div>

              {searchResult && (
                <div className="search-result">
                  <div className="user-card-header">
                    <h5>
                      <FontAwesomeIcon icon={faUsers} />
                      Datos del Usuario
                    </h5>
                  </div>
                  <div className="user-info">
                    <div className="info-item">
                      <strong>Nombre:</strong> {searchResult.nombre || "—"}
                    </div>
                    <div className="info-item">
                      <strong>
                        <FontAwesomeIcon icon={faPhone} />
                        Teléfono:
                      </strong> 
                      {searchResult.telefono}
                    </div>
                    <div className="info-item">
                      <strong>CUIL:</strong> {searchResult.cuil || "—"}
                    </div>
                    <div className="info-item">
                      <strong>Plataformas:</strong> {searchResult.plataformas?.join(", ") || "—"}
                    </div>
                  </div>

                  <h6 className="history-title">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    Historial de conversaciones
                  </h6>
                  <div className="chat-history">
                    {searchHistory.length === 0 ? (
                      <p className="no-messages">No hay mensajes registrados</p>
                    ) : (
                      searchHistory.map((m, idx) => (
                        <div key={idx} className={`message-preview ${m.rol}-preview`}>
                          <div className="message-content">{m.contenido}</div>
                          <small className="message-time">
                            {formatMessageTime(m.createdAt)}
                          </small>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeMenu === "pending-users" && (
            <div className="pending-users-section">
              <h3 className="section-title">
                <FontAwesomeIcon icon={faUsers} />
                Usuarios Pendientes
              </h3>
              <p className="section-description">Revisa y aprueba nuevos registros de usuarios</p>

              {loadingPending && (
                <div className="loading">
                  <div className="loading-spinner"></div>
                  Cargando usuarios pendientes...
                </div>
              )}

              {!loadingPending && pendingUsers.length === 0 && (
                <div className="no-data">
                  <FontAwesomeIcon icon={faUsers} />
                  <p>No hay usuarios pendientes de aprobación</p>
                </div>
              )}

              <div className="users-grid">
                {pendingUsers.map((u) => (
                  <div key={u.id} className="user-card">
                    <div className="user-card-header">
                      <div className="user-avatar">
                        <span>{(u.nombre || "U").charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="user-status pending">Pendiente</div>
                    </div>
                    <div className="user-info">
                      <h4>{u.nombre || "Sin nombre"}</h4>
                      <div className="user-details">
                        <div className="detail-item">
                          <FontAwesomeIcon icon={faPhone} />
                          <span>{u.phone}</span>
                        </div>
                        <div className="detail-item">
                          <span>CUIL: {u.cuil || "No especificado"}</span>
                        </div>
                        <div className="detail-item">
                          <span>Plataformas: {u.plataformas || "No especificado"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="user-actions">
                      <button
                        className="approve-btn"
                        onClick={() => handleApproveUser(u.id)}
                      >
                        <FontAwesomeIcon icon={faCircle} />
                        Aprobar
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleRejectUser(u.id)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMenu === "complaints" && (
            <div className="complaints-section">
              <h3 className="section-title">
                <FontAwesomeIcon icon={faFileAlt} />
                Reclamos
              </h3>
              <p className="section-description">Gestiona reclamos y consultas de usuarios</p>

              {loadingComplaints && (
                <div className="loading">
                  <div className="loading-spinner"></div>
                  Cargando reclamos...
                </div>
              )}

              {!loadingComplaints && complaints.length === 0 && (
                <div className="no-data">
                  <FontAwesomeIcon icon={faFileAlt} />
                  <p>No hay reclamos registrados</p>
                </div>
              )}

              <div className="complaints-grid">
                {complaints.map((c) => (
                  <div key={c.id} className="complaint-card">
                    <div className="complaint-header">
                      <div className="complaint-user">
                        <div className="user-avatar">
                          <span>{(c.user?.nombre || "U").charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="user-info">
                          <strong>{c.user?.nombre || "Usuario"}</strong>
                          <span>
                            <FontAwesomeIcon icon={faPhone} />
                            {c.user?.telefono}
                          </span>
                        </div>
                      </div>
                      <span className={`status-badge ${c.estado}`}>
                        {c.estado}
                      </span>
                    </div>
                    
                    <div className="complaint-body">
                      <div className="complaint-message">
                        "{c.mensaje}"
                      </div>
                      <div className="complaint-date">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        {formatMessageTime(c.createdAt)}
                      </div>
                    </div>

                    {c.estado === "pendiente" && (
                      <div className="complaint-actions">
                        <button
                          className="resolve-btn"
                          onClick={() => updateComplaintStatus(c.id, "atendido")}
                        >
                          <FontAwesomeIcon icon={faCircle} />
                          Marcar como atendido
                        </button>
                        <button
                          className="reject-complaint-btn"
                          onClick={() => updateComplaintStatus(c.id, "rechazado")}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMenu === "settings" && (
            <div className="settings-section">
              <h3 className="section-title">
                <FontAwesomeIcon icon={faCog} />
                Configuración
              </h3>
              <p className="section-description">Ajustes del panel de administración</p>
              <div className="settings-placeholder">
                <p>Configuraciones del sistema próximamente...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;