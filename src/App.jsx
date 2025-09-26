import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatUser from "./components/ChatUser";
import LoginAdmin from "./components/LoginAdmin";
import AdminPanel from "./components/AdminPanel";
import "bootstrap/dist/css/bootstrap.min.css";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatUser />} />
        <Route path="/admin/login" element={<LoginAdmin />} />
        <Route path="/admin/panel" element={<AdminPanel />} />
        <Route path="/admin/conversations" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}
