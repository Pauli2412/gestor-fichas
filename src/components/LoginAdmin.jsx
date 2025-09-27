// src/components/LoginAdmin.jsx
import React, { useState, useEffect } from "react";
import { Form, Button, InputGroup, Alert, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldAlt,
  faUserShield,
  faUser,
  faLock,
  faEye,
  faEyeSlash,
  faExclamationTriangle,
  faCheckCircle,
  faMoon,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import { loginAdmin } from "../services/api";
import "./LoginForm.css";

const LoginAdmin = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!username || !password) {
      setMessage({ type: "error", text: "Por favor completa todos los campos" });
      return;
    }

    setLoading(true);

    try {
      const data = await loginAdmin(username, password);

      if (data.ok) {
        setMessage({ type: "success", text: `¡Bienvenido ${data.admin.user}!` });
        localStorage.setItem("adminToken", data.token);

        if (onLogin) onLogin(data.admin);

        setTimeout(() => {
          window.location.href = "/admin/conversations"; // redirección
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Usuario o contraseña incorrectos",
        });
      }
    } catch (err) {
      console.error("❌ Error en login:", err);
      setMessage({ type: "error", text: "Error de conexión con el servidor" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      <div className="login-container">
        <Button onClick={toggleTheme} className="theme-toggle">
          <FontAwesomeIcon icon={theme === "dark" ? faMoon : faSun} />
        </Button>

        <div className="header">
          <div className="logo">
            <FontAwesomeIcon icon={faShieldAlt} />
            <h1>Admin Panel</h1>
          </div>
          <p className="subtitle">Panel de Administración</p>
          <div className="admin-badge">
            <FontAwesomeIcon icon={faUserShield} />
            Acceso Restringido
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          {message.text && (
            <Alert variant={message.type === "error" ? "danger" : "success"}>
              <FontAwesomeIcon
                icon={
                  message.type === "error" ? faExclamationTriangle : faCheckCircle
                }
              />
              &nbsp;
              {message.text}
            </Alert>
          )}

          <Form.Group className="mb-4">
            <Form.Label>Usuario</Form.Label>
            <InputGroup className="input-wrapper">
              <InputGroup.Text className="input-icon">
                <FontAwesomeIcon icon={faUser} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                required
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Contraseña</Form.Label>
            <InputGroup className="input-wrapper">
              <InputGroup.Text className="input-icon">
                <FontAwesomeIcon icon={faLock} />
              </InputGroup.Text>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
              <Button
                variant="link"
                onClick={togglePasswordVisibility}
                className="password-toggle"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </Button>
            </InputGroup>
          </Form.Group>

          <div className="remember-forgot">
            <Form.Check
              type="checkbox"
              id="remember"
              label="Recordar sesión"
              className="checkbox-wrapper"
            />
            <a href="#" className="forgot-password">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <Button type="submit" className="login-btn" disabled={loading} href="/admin/conversations">
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="loading-spinner"
                />
                &nbsp; Verificando...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </Form>

        <div className="footer mt-4 text-center">
          <p>© 2024 Gestor de Fichas. Sistema seguro de administración.</p>
        </div>
      </div>
    </>
  );
};

export default LoginAdmin;
