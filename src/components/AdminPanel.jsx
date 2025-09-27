import React, { useState, useEffect } from "react";
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
} from "@fortawesome/free-solid-svg-icons";

const AdminPanel = () => {
  const [activeMenu, setActiveMenu] = useState("conversations");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Funciones existentes (mantener toda la lógica original)
  useEffect(() => {
    if (activeMenu === "conversations") {
      // Simular datos para demo
      setConversations([
        { telefono: "123456789", nombre: "Juan Pérez" },
        { telefono: "987654321", nombre: "María González" },
        { telefono: "555666777", nombre: "Carlos López" }
      ]);
    }
  }, [activeMenu]);

  useEffect(() => {
    if (selectedConversation) {
      // Simular historial de chat para demo
      setChatHistory([
        {
          rol: "user",
          contenido: "Hola, necesito ayuda con mi cuenta",
          createdAt: new Date().toISOString()
        },
        {
          rol: "bot",
          contenido: "¡Hola! Te puedo ayudar con tu consulta. ¿Qué problema tienes?",
          createdAt: new Date().toISOString()
        },
        {
          rol: "user",
          contenido: "No puedo acceder a mi cuenta",
          createdAt: new Date().toISOString()
        }
      ]);
    }
  }, [selectedConversation]);

  const handleSendAdminMessage = async () => {
    if (!adminMessage.trim() || !selectedConversation) return;

    const newMsg = {
      rol: "admin",
      contenido: adminMessage,
      createdAt: new Date().toISOString(),
    };

    setChatHistory((prev) => [...prev, newMsg]);
    setAdminMessage("");
  };

  const handleSearchUser = async () => {
    if (!searchQuery.trim()) return;
    
    // Simular búsqueda para demo
    setSearchResult({
      nombre: "Usuario Demo",
      telefono: searchQuery,
      cuil: "20-12345678-9",
      plataformas: ["WhatsApp", "Telegram"]
    });
    
    setSearchHistory([
      {
        rol: "user",
        contenido: "Consulta sobre servicios",
        createdAt: new Date().toISOString()
      }
    ]);
  };

  const fetchPendingUsers = async () => {
    setLoadingPending(true);
    // Simular datos para demo
    setTimeout(() => {
      setPendingUsers([
        {
          id: 1,
          nombre: "Ana García",
          phone: "123456789",
          cuil: "27-12345678-0",
          plataformas: "WhatsApp"
        },
        {
          id: 2,
          nombre: "Pedro Martínez",
          phone: "987654321",
          cuil: "20-87654321-5",
          plataformas: "Telegram"
        }
      ]);
      setLoadingPending(false);
    }, 1000);
  };

  const handleApproveUser = async (userId) => {
    alert("Usuario aprobado ✅");
    fetchPendingUsers();
  };

  const handleRejectUser = async (userId) => {
    alert("Usuario rechazado ❌");
    fetchPendingUsers();
  };

  const fetchComplaints = async () => {
    setLoadingComplaints(true);
    // Simular datos para demo
    setTimeout(() => {
      setComplaints([
        {
          id: 1,
          mensaje: "Problema con el servicio de atención",
          estado: "pendiente",
          user: { nombre: "Luis Rodríguez", telefono: "555123456" },
          createdAt: new Date().toISOString()
        }
      ]);
      setLoadingComplaints(false);
    }, 1000);
  };

  const updateComplaintStatus = async (id, estado) => {
    alert(`Reclamo marcado como ${estado}`);
    fetchComplaints();
  };

  useEffect(() => {
    if (activeMenu === "pending-users") {
      fetchPendingUsers();
    }
  }, [activeMenu]);

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
            <button className="logout-btn">
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
              {/* Lista de conversaciones */}
              <div className="conversations-list">
                <h4 className="section-title">📥 Conversaciones activas</h4>
                <div className="conversation-items">
                  {conversations.map((c, idx) => (
                    <div
                      key={idx}
                      className={`conversation-item ${
                        selectedConversation?.telefono === c.telefono ? "active" : ""
                      }`}
                      onClick={() => setSelectedConversation(c)}
                    >
                      <div className="conversation-info">
                        <strong>{c.nombre || "Usuario"}</strong>
                        <small>{c.telefono}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat seleccionado */}
              <div className="chat-section">
                {selectedConversation ? (
                  <>
                    <div className="chat-header">
                      <h4>
                        Chat con {selectedConversation.nombre || "Usuario"} (
                        {selectedConversation.telefono})
                      </h4>
                    </div>
                    <div className="chat-messages">
                      {chatHistory.length === 0 ? (
                        <p className="no-messages">No hay mensajes aún.</p>
                      ) : (
                        chatHistory.map((m, idx) => (
                          <div
                            key={idx}
                            className={`message ${m.rol === "user" ? "user-message" : 
                              m.rol === "bot" ? "bot-message" : "admin-message"}`}
                          >
                            <div className="message-content">{m.contenido}</div>
                            <small className="message-time">
                              {new Date(m.createdAt).toLocaleTimeString("es-AR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </small>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="chat-input">
                      <input
                        type="text"
                        className="message-input"
                        placeholder="Escribe una respuesta..."
                        value={adminMessage}
                        onChange={(e) => setAdminMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendAdminMessage()}
                      />
                      <button className="send-btn" onClick={handleSendAdminMessage}>
                        <FontAwesomeIcon icon={faPaperPlane} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="no-selection">
                    <p>Selecciona una conversación para ver el chat.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === "users" && (
            <div className="users-section">
              <h3 className="section-title">👤 Usuarios</h3>
              <p className="section-description">Busca usuarios por nombre o teléfono.</p>

              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar por nombre o teléfono..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="search-btn" onClick={handleSearchUser}>
                  Buscar
                </button>
              </div>

              {searchResult && (
                <div className="search-result">
                  <h5>📌 Datos del Usuario</h5>
                  <div className="user-info">
                    <p><strong>Nombre:</strong> {searchResult.nombre || "—"}</p>
                    <p><strong>Teléfono:</strong> {searchResult.telefono}</p>
                    <p><strong>CUIL:</strong> {searchResult.cuil || "—"}</p>
                    <p><strong>Plataformas:</strong> {searchResult.plataformas?.join(", ") || "—"}</p>
                  </div>

                  <h6 className="history-title">🕒 Historial de chat</h6>
                  <div className="chat-history">
                    {searchHistory.length === 0 ? (
                      <p className="no-messages">No hay mensajes.</p>
                    ) : (
                      searchHistory.map((m, idx) => (
                        <div key={idx} className={`message ${m.rol}-message`}>
                          <div className="message-content">{m.contenido}</div>
                          <small className="message-time">
                            {new Date(m.createdAt).toLocaleString("es-AR")}
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
              <h3 className="section-title">👥 Usuarios Pendientes</h3>
              <p className="section-description">Lista de usuarios registrados que requieren aprobación.</p>

              {loadingPending && <div className="loading">Cargando...</div>}

              {!loadingPending && pendingUsers.length === 0 && (
                <p className="no-data">No hay usuarios pendientes.</p>
              )}

              <div className="users-grid">
                {pendingUsers.map((u) => (
                  <div key={u.id} className="user-card">
                    <div className="user-info">
                      <strong>{u.nombre || "—"}</strong>
                      <div className="user-details">
                        <span>Tel: {u.phone}</span>
                        <span>CUIL: {u.cuil || "—"}</span>
                        <span>Plataformas: {u.plataformas || "—"}</span>
                      </div>
                    </div>
                    <div className="user-actions">
                      <button
                        className="approve-btn"
                        onClick={() => handleApproveUser(u.id)}
                      >
                        ✅ Aprobar
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleRejectUser(u.id)}
                      >
                        ❌ Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMenu === "complaints" && (
            <div className="complaints-section">
              <h3 className="section-title">📝 Reclamos</h3>
              <p className="section-description">Listado de reclamos enviados por los usuarios.</p>

              {loadingComplaints && <div className="loading">Cargando...</div>}

              {!loadingComplaints && complaints.length === 0 && (
                <p className="no-data">No hay reclamos registrados.</p>
              )}

              <div className="complaints-grid">
                {complaints.map((c) => (
                  <div key={c.id} className="complaint-card">
                    <div className="complaint-info">
                      <div className="complaint-user">
                        <strong>{c.user?.nombre || "Usuario"}</strong> ({c.user?.telefono})
                      </div>
                      <div className="complaint-message">{c.mensaje}</div>
                      <div className="complaint-meta">
                        <span className={`status-badge ${c.estado}`}>{c.estado}</span>
                        <small className="complaint-date">
                          {new Date(c.createdAt).toLocaleString("es-AR")}
                        </small>
                      </div>
                    </div>
                    {c.estado === "pendiente" && (
                      <div className="complaint-actions">
                        <button
                          className="approve-btn"
                          onClick={() => updateComplaintStatus(c.id, "atendido")}
                        >
                          ✅ Atendido
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => updateComplaintStatus(c.id, "rechazado")}
                        >
                          ❌ Rechazar
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
              <h3 className="section-title">⚙️ Configuración</h3>
              <p className="section-description">Ajustes del panel de administración.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}