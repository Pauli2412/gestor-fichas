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
import "./AdminPanel.css"; // Importar el CSS

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

  // 🔹 Cargar conversaciones activas
  useEffect(() => {
    if (activeMenu === "conversations") {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/conversations`)
        .then((res) => res.json())
        .then((data) => setConversations(data.conversations || []))
        .catch((err) => console.error("Error cargando conversaciones:", err));
    }
  }, [activeMenu]);

  // 🔹 Cargar historial cuando se selecciona una conversación
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

  // 🔹 Enviar respuesta del admin
  const handleSendAdminMessage = async () => {
    if (!adminMessage.trim() || !selectedConversation) return;

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

      // 💾 Guardar mensaje en UI
      const newMsg = {
        rol: "admin",
        contenido: adminMessage,
        createdAt: new Date().toISOString(),
      };

      setChatHistory((prev) => [...prev, newMsg]);
      setAdminMessage(""); // limpiar input
    } catch (err) {
      console.error("Error enviando mensaje admin:", err);
      alert("⚠️ No se pudo enviar el mensaje.");
    }
  };

  // 🔹 Buscar usuario
  const handleSearchUser = async () => {
    if (!searchQuery.trim()) return;

    try {
      // 1. Buscar datos del usuario
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

      // 2. Cargar historial
      const histRes = await fetch(`${import.meta.env.VITE_N8N_BASE}/chat-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefono: data.user.telefono }),
      });

      const histData = await histRes.json();
      setSearchHistory(histData.history || []);
    } catch (err) {
      console.error("Error en búsqueda:", err);
      alert("⚠️ No se pudo buscar el usuario.");
    }
  };

  // Cargar usuarios pendientes
  const fetchPendingUsers = async () => {
    setLoadingPending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/pending-users`);
      const data = await res.json();
      setPendingUsers(data.users || []);
    } catch (err) {
      console.error("Error cargando usuarios pendientes:", err);
      alert("⚠️ No se pudieron cargar los usuarios pendientes.");
    } finally {
      setLoadingPending(false);
    }
  };

  // Aprobar usuario
  const handleApproveUser = async (userId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/approve-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Error aprobando usuario");
      alert("Usuario aprobado ✅");
      fetchPendingUsers();
    } catch (err) {
      console.error(err);
      alert("⚠️ No se pudo aprobar el usuario.");
    }
  };

  // Rechazar usuario
  const handleRejectUser = async (userId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/reject-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Error rechazando usuario");
      alert("Usuario rechazado ❌");
      fetchPendingUsers();
    } catch (err) {
      console.error(err);
      alert("⚠️ No se pudo rechazar el usuario.");
    }
  };

  useEffect(() => {
    if (activeMenu === "pending-users") {
      fetchPendingUsers();
    }
  }, [activeMenu]);

  // Cargar reclamos
  const fetchComplaints = async () => {
    setLoadingComplaints(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/complaints`);
      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Error cargando reclamos:", err);
      alert("⚠️ No se pudieron cargar los reclamos.");
    } finally {
      setLoadingComplaints(false);
    }
  };

  // Actualizar estado de un reclamo
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
      alert("⚠️ No se pudo actualizar el reclamo.");
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
};

export default AdminPanel;