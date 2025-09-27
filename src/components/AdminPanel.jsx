import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faUsers,
  faFileAlt,
  faCog,
  faSignOutAlt,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [activeMenu, setActiveMenu] = useState("conversations");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [adminMessage, setAdminMessage] = useState(""); // 💬 input admin

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

  // Estados extra arriba del componente
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

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

  // Estados
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);

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

  // Estados Reclamos
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

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


  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <div
        className="bg-dark text-white d-flex flex-column p-3"
        style={{ width: "250px" }}
      >
        <h2 className="text-center mb-4">AdminPanel</h2>

        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item">
            <button
              className={`nav-link text-start ${activeMenu === "conversations" ? "active" : "text-white"
                }`}
              onClick={() => setActiveMenu("conversations")}
            >
              <FontAwesomeIcon icon={faComments} className="me-2" />
              Conversaciones
            </button>
          </li>


          <li>
            <button
              className={`nav-link text-start ${activeMenu === "users" ? "active" : "text-white"
                }`}
              onClick={() => setActiveMenu("users")}
            >
              <FontAwesomeIcon icon={faUsers} className="me-2" />
              Usuarios
            </button>
          </li>
          <li className={`list-group-item ${activeMenu === "pending-users" ? "active" : ""}`}
            onClick={() => setActiveMenu("pending-users")}>
            Usuarios Pendientes
          </li>
          <li>
            <button
              className={`nav-link text-start ${activeMenu === "complaints" ? "active" : "text-white"
                }`}
              onClick={() => setActiveMenu("complaints")}
            >
              <FontAwesomeIcon icon={faFileAlt} className="me-2" />
              Reclamos
            </button>
          </li>
          <li>
            <button
              className={`nav-link text-start ${activeMenu === "settings" ? "active" : "text-white"
                }`}
              onClick={() => setActiveMenu("settings")}
            >
              <FontAwesomeIcon icon={faCog} className="me-2" />
              Configuración
            </button>
          </li>
        </ul>

        <hr />
        <button className="btn btn-outline-light mt-auto">
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
          Salir
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4 d-flex flex-column">
        <h1 className="mb-4">Panel de Administración</h1>

        {activeMenu === "conversations" && (
          <div className="d-flex flex-grow-1">
            {/* Lista de conversaciones */}
            <div
              className="border-end pe-3"
              style={{ width: "280px", overflowY: "auto" }}
            >
              <h4>📥 Conversaciones activas</h4>
              <ul className="list-group">
                {conversations.map((c, idx) => (
                  <li
                    key={idx}
                    className={`list-group-item list-group-item-action ${selectedConversation?.telefono === c.telefono
                      ? "active"
                      : ""
                      }`}
                    onClick={() => setSelectedConversation(c)}
                    style={{ cursor: "pointer" }}
                  >
                    <strong>{c.nombre || "Usuario"}</strong>
                    <br />
                    <small>{c.telefono}</small>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chat seleccionado */}
            <div className="flex-grow-1 ps-3 d-flex flex-column">
              {selectedConversation ? (
                <>
                  <h4>
                    Chat con {selectedConversation.nombre || "Usuario"} (
                    {selectedConversation.telefono})
                  </h4>
                  <div
                    className="border flex-grow-1 p-3 mb-3"
                    style={{ overflowY: "auto", background: "#f9f9f9" }}
                  >
                    {chatHistory.length === 0 ? (
                      <p className="text-muted">No hay mensajes aún.</p>
                    ) : (
                      chatHistory.map((m, idx) => (
                        <div
                          key={idx}
                          className={`p-2 mb-2 rounded ${m.rol === "user"
                            ? "bg-light text-dark"
                            : m.rol === "bot"
                              ? "bg-primary text-white"
                              : "bg-success text-white"
                            }`}
                          style={{ maxWidth: "75%" }}
                        >
                          <div>{m.contenido}</div>
                          <small className="d-block text-end">
                            {new Date(m.createdAt).toLocaleTimeString("es-AR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </small>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 🔹 Caja de texto para responder */}
                  <div className="d-flex">
                    <input
                      type="text"
                      className="form-control me-2"
                      placeholder="Escribe una respuesta..."
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSendAdminMessage()
                      }
                    />
                    <button
                      className="btn btn-success"
                      onClick={handleSendAdminMessage}
                    >
                      <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-muted flex-grow-1 d-flex align-items-center justify-content-center">
                  Selecciona una conversación para ver el chat.
                </p>
              )}
            </div>
          </div>
        )}

        {activeMenu === "users" && (
          <div className="d-flex flex-column flex-grow-1">
            <h3>👤 Usuarios</h3>
            <p>Busca usuarios por nombre o teléfono.</p>

            {/* 🔹 Barra de búsqueda */}
            <div className="input-group mb-3" style={{ maxWidth: "400px" }}>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre o teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleSearchUser}>
                Buscar
              </button>
            </div>

            {/* 🔹 Resultado de la búsqueda */}
            {searchResult && (
              <div className="border rounded p-3 bg-light">
                <h5>📌 Datos del Usuario</h5>
                <p><strong>Nombre:</strong> {searchResult.nombre || "—"}</p>
                <p><strong>Teléfono:</strong> {searchResult.telefono}</p>
                <p><strong>CUIL:</strong> {searchResult.cuil || "—"}</p>
                <p><strong>Plataformas:</strong> {searchResult.plataformas?.join(", ") || "—"}</p>

                <h6 className="mt-3">🕒 Historial de chat</h6>
                <div className="border p-2" style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {searchHistory.length === 0 ? (
                    <p className="text-muted">No hay mensajes.</p>
                  ) : (
                    searchHistory.map((m, idx) => (
                      <div
                        key={idx}
                        className={`p-2 mb-2 rounded ${m.rol === "user"
                          ? "bg-light text-dark"
                          : m.rol === "bot"
                            ? "bg-primary text-white"
                            : "bg-success text-white"
                          }`}
                      >
                        {m.contenido}
                        <br />
                        <small className="d-block text-end">
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
          <div className="d-flex flex-column flex-grow-1">
            <h3>👥 Usuarios Pendientes</h3>
            <p>Lista de usuarios registrados que requieren aprobación.</p>

            {loadingPending && <p>Cargando...</p>}

            {!loadingPending && pendingUsers.length === 0 && (
              <p className="text-muted">No hay usuarios pendientes.</p>
            )}

            <ul className="list-group">
              {pendingUsers.map((u) => (
                <li
                  key={u.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>{u.nombre || "—"}</strong> <br />
                    Tel: {u.phone} <br />
                    CUIL: {u.cuil || "—"} <br />
                    Plataformas: {u.plataformas || "—"}
                  </div>
                  <div>
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => handleApproveUser(u.id)}
                    >
                      ✅ Aprobar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRejectUser(u.id)}
                    >
                      ❌ Rechazar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}


        {activeMenu === "complaints" && (
          <div className="d-flex flex-column flex-grow-1">
            <h3>📝 Reclamos</h3>
            <p>Listado de reclamos enviados por los usuarios.</p>

            {loadingComplaints && <p>Cargando...</p>}

            {!loadingComplaints && complaints.length === 0 && (
              <p className="text-muted">No hay reclamos registrados.</p>
            )}

            <ul className="list-group">
              {complaints.map((c) => (
                <li
                  key={c.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>{c.user?.nombre || "Usuario"}</strong> ({c.user?.telefono})<br />
                    <em>{c.mensaje}</em><br />
                    Estado:{" "}
                    <span
                      className={`badge ${c.estado === "pendiente" ? "bg-warning" : "bg-success"
                        }`}
                    >
                      {c.estado}
                    </span>
                    <br />
                    <small>
                      {new Date(c.createdAt).toLocaleString("es-AR")}
                    </small>
                  </div>
                  <div>
                    {c.estado === "pendiente" && (
                      <>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => updateComplaintStatus(c.id, "atendido")}
                        >
                          ✅ Atendido
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => updateComplaintStatus(c.id, "rechazado")}
                        >
                          ❌ Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}


        {activeMenu === "settings" && (
          <div>
            <h3>⚙️ Configuración</h3>
            <p>Ajustes del panel de administración.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
