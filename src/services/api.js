import axios from "axios";

// Si usas un proyecto basado en Vite, `import.meta.env` es la forma correcta.
// Asegúrate de que tus variables de entorno comiencen con VITE_
const N8N_BASE_URL = import.meta.env.VITE_N8N_BASE_URL;
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

// **IMPORTANTE**: Verifica que las variables de entorno se hayan cargado.
// Podrías lanzar un error o loguear una advertencia si no están presentes.
if (!N8N_BASE_URL || !BACKEND_BASE_URL) {
    console.error("¡ERROR! Las URLs base de la API no están configuradas en el entorno.");
    // En un entorno de producción, podrías querer lanzar un error.
    // throw new Error("API Base URLs not configured.");
}

// === BASE URLs ===
// n8n (para usuarios finales)
const n8nApi = axios.create({
  baseURL: N8N_BASE_URL,
  withCredentials: false,
});

// Backend Node.js (para admins)
const backendApi = axios.create({
  baseURL: BACKEND_BASE_URL,
  withCredentials: true,
});

// ---

// === N8N ENDPOINTS (USUARIO FINAL) ===

// Buscar usuario (lookup)
export const lookupUsuario = async (telefono) => {
  const { data } = await n8nApi.post("/lookup-usuario", { telefono });
  return data; // 👈 devuelve JSON con {status, reply, options, meta}
};

// Registrar nuevo usuario
export const nuevoUsuario = async (payload) => {
  const { data } = await n8nApi.post("/nuevo-usuario", payload);
  return data; // 👈 idem arriba
};

// Solicitud de retiro
export const sendRetiro = async (telefono, monto, plataforma) => {
  const { data } = await n8nApi.post("/withdraw-request", { telefono, monto, plataforma });
  return data;
};

// Reclamo
export const sendReclamo = async (telefono, mensaje) => {
  const { data } = await n8nApi.post("/complaint", { telefono, mensaje });
  return data;
};

// Historial (⚠️ valida si existe este endpoint en n8n)
export const getHistorial = async (telefono) => {
  const { data } = await n8nApi.get(`/historial?telefono=${encodeURIComponent(telefono)}`);
  return data;
};

// ---

// === BACKEND ENDPOINTS (ADMIN) ===

// Login admin
export const loginAdmin = async (user, pass) => {
  const { data } = await backendApi.post("/admin/login", { user, pass });
  return data;
};

// Conversaciones (soporte admin)
export const getConversations = async () => {
  const { data } = await backendApi.get("/admin/conversations");
  return data;
};

// Traer historial de conversación del usuario (se asume que llama al backend n8n)
export const getChatHistory = (telefono) =>
  n8nApi.post("/chat-history", { telefono }).then((res) => res.data);


export default {
  lookupUsuario,
  nuevoUsuario,
  sendRetiro,
  sendReclamo,
  getHistorial,
  loginAdmin,
  getConversations,
  getChatHistory, // Agregué esta función al export default para que esté disponible
};
