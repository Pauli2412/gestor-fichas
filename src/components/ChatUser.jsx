import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
} from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './chat.css';

// Componente para las burbujas de mensaje
const MessageBubble = ({ message }) => {
  const { content, sender, time } = message;
  
  return (
    <div className={`message message-${sender}`}>
      {React.isValidElement(content) ? (
        content
      ) : typeof content === 'string' && content.includes('<') ? (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
      )}
      <div className="message-time">{time}</div>
    </div>
  );
};

const ChatUser = () => {
  const [theme, setTheme] = useState('dark');
  const [chatActive, setChatActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [tempData, setTempData] = useState({});
  const [inactivityTimer, setInactivityTimer] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const messagesEndRef = useRef(null);

  // Helper para obtener hora actual
  const nowTime = () =>
    new Date().toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });

  // Auto scroll
  useEffect(() => {
    if (chatActive) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatActive]);

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // En móvil, colapsar sidebar automáticamente cuando el chat está activo
      if (mobile && chatActive) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
        '⏰ La conversación se cerró por inactividad. ¡Gracias por contactarnos!',
        'bot'
      );
      setChatActive(false);
      setUserPhone('');
      setIsRegistered(false);
      setPendingAction(null);
      setTempData({});
    }, 5 * 60 * 1000); // 5 minutos
    setInactivityTimer(t);
  };

  // Agregar mensaje
  const addMessage = (content, sender) => {
    setMessages((prev) => [...prev, { content, sender, time: nowTime() }]);
    resetInactivityTimer();
  };

  // Opciones principales después del login
  const addMainOptions = () => {
    if (!isRegistered) return;
    addMessage(
      <div className="action-buttons" style={{ marginTop: 6 }}>
        <button className="action-btn" onClick={() => handleQuickOption('retiro')}>
          Retiro
        </button>
        <button className="action-btn secondary" onClick={() => handleQuickOption('mensaje')}>
          Mensaje
        </button>
        <button className="action-btn secondary" onClick={() => handleQuickOption('historial')}>
          Historial
        </button>
        <button className="action-btn secondary" onClick={() => handleQuickOption('cancelar')}>
          Cancelar
        </button>
      </div>,
      'bot'
    );
  };

  // Opciones para registro de nuevo usuario
  const addRegisterAskOptions = () => {
    addMessage(
      <div className="action-buttons" style={{ marginTop: 6 }}>
        <button
          className="action-btn"
          onClick={() => {
            addMessage('Iniciar registro', 'user');
            setPendingAction('crear-cuenta-nombre');
            addMessage('📌 Ingresa tu Nombre completo:', 'bot');
          }}
        >
          Iniciar registro
        </button>
        <button
          className="action-btn secondary"
          onClick={() => {
            addMessage('Cancelar', 'user');
            addMessage('❌ Registro cancelado. Si necesitas ayuda, escribe tu teléfono nuevamente.', 'bot');
            setPendingAction(null);
            setTempData({});
            setIsRegistered(false);
            setUserPhone('');
          }}
        >
          Cancelar
        </button>
      </div>,
      'bot'
    );
  };

  // Manejar opciones rápidas
  const handleQuickOption = async (opt) => {
    addMessage(opt, 'user');

    // Aquí iría la lógica para procesar cada opción
    switch (opt.toLowerCase()) {
      case 'retiro':
        setPendingAction('retiro-monto');
        addMessage('💰 Ingresa el monto que deseas retirar:', 'bot');
        break;
      case 'mensaje':
        setPendingAction('reclamo-texto');
        addMessage('📝 Escribe el motivo de tu mensaje:', 'bot');
        break;
      case 'historial':
        await handleHistory();
        addMainOptions();
        break;
      case 'cancelar':
        setPendingAction(null);
        setTempData({});
        addMessage('❌ Acción cancelada. ¿En qué más puedo ayudarte?', 'bot');
        addMainOptions();
        break;
      default:
        addMessage('Opción procesada correctamente.', 'bot');
        addMainOptions();
    }
  };

  // Placeholder dinámico para el input
  const inputPlaceholder = () => {
    if (!userPhone) return 'Escribe tu número de teléfono...';
    switch (pendingAction) {
      case 'crear-cuenta-nombre':
        return 'Ingresa tu Nombre completo';
      case 'crear-cuenta-cuil':
        return 'Ingresa tu CUIL';
      case 'crear-cuenta-plataforma':
        return 'Ingresa tu Plataforma';
      case 'retiro-monto':
        return 'Ingresa el monto que deseas retirar';
      case 'retiro-plataforma':
        return 'Ingresa la plataforma desde la cual retirar';
      case 'reclamo-texto':
        return 'Escribe el motivo de tu mensaje';
      default:
        return 'Escribe un mensaje... (o usa los botones)';
    }
  };

  // Cambio de tema
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Inicializar chat
  const initializeChat = () => {
    if (!chatActive) {
      setChatActive(true);
      // En móvil, colapsar sidebar automáticamente
      if (isMobile) {
        setSidebarCollapsed(true);
      }
      addMessage(
        '¡Hola! 👋 Soy tu asistente para gestionar fichas.<br>Por favor, ingresa tu número de teléfono para buscar tus plataformas.',
        'bot'
      );
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Procesar mensaje del usuario
  const processUserMessage = async (message) => {
    setIsTyping(true);
    await new Promise((res) => setTimeout(res, 300));

    const m = String(message || '').trim();

    // Cancelación global
    if (m.toLowerCase() === 'cancelar') {
      setPendingAction(null);
      setTempData({});
      addMessage('❌ Acción cancelada. ¿En qué más puedo ayudarte?', 'bot');
      addMainOptions();
      setIsTyping(false);
      return;
    }

    // Si no hay teléfono, validar
    if (!userPhone) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
      if (phoneRegex.test(m.replace(/\s/g, ''))) {
        setUserPhone(m);
        await handleLogin(m);
      } else {
        addMessage('⚠️ Ingresa un número válido. Ejemplo: +123456789', 'bot');
      }
      setIsTyping(false);
      return;
    }

    // Si hay acción pendiente, procesarla
    if (pendingAction) {
      await handlePendingAction(m);
      setIsTyping(false);
      return;
    }

    // Solo permitir acciones si está registrado
    if (!isRegistered) {
      addMessage('ℹ️ Primero verifica tu número o completa el registro.', 'bot');
      setIsTyping(false);
      return;
    }

    // Procesar mensaje libre (aquí iría la integración con la API)
    addMessage('Mensaje recibido. Un asesor te contactará pronto.', 'bot');
    addMainOptions();
    
    setIsTyping(false);
  };

  // Enviar mensaje
  const sendMessage = async () => {
    const message = inputValue.trim();
    if (!message) return;
    addMessage(message, 'user');
    setInputValue('');
    await processUserMessage(message);
  };

  // Manejar acciones pendientes
  const handlePendingAction = async (text) => {
    switch (pendingAction) {
      case 'crear-cuenta-nombre':
        setTempData((d) => ({ ...d, nombre: text }));
        addMessage('📌 Ingresa tu CUIL:', 'bot');
        setPendingAction('crear-cuenta-cuil');
        break;

      case 'crear-cuenta-cuil':
        setTempData((d) => ({ ...d, cuil: text }));
        addMessage('📌 Ingresa tu Plataforma:', 'bot');
        setPendingAction('crear-cuenta-plataforma');
        break;

      case 'crear-cuenta-plataforma':
        // Aquí iría la llamada a la API de registro
        addMessage('✅ Usuario enviado a registro correctamente. Espera unos minutos o ¿Deseas comunicarte con un asesor?', 'bot');
        setIsRegistered(true);
        setPendingAction(null);
        setTempData({});
        addMainOptions();
        break;

      case 'retiro-monto':
        const monto = parseFloat(String(text).replace(/[^\d.]/g, ''));
        if (isNaN(monto) || monto <= 0) {
          addMessage('⚠️ Monto inválido. Ingresa un número mayor a 0.', 'bot');
          return;
        }
        setTempData({ monto });
        addMessage('📌 Ingresa la plataforma desde la cual retirar:', 'bot');
        setPendingAction('retiro-plataforma');
        break;

      case 'retiro-plataforma':
        await handleWithdraw(tempData.monto, text);
        setPendingAction(null);
        setTempData({});
        addMainOptions();
        break;

      case 'reclamo-texto':
        await handleComplaint(text);
        setPendingAction(null);
        addMainOptions();
        break;

      default:
        setPendingAction(null);
        addMessage('⚠️ Acción no reconocida.', 'bot');
        addMainOptions();
        break;
    }
  };

  // Simulación de login
  const handleLogin = async (phone) => {
    await new Promise(res => setTimeout(res, 1500));
    
    // Simulación: algunos números son "encontrados", otros no
    const existingNumbers = ['+5491123456789', '+5491987654321'];
    const normalizedPhone = phone.startsWith('+') ? phone : '+549' + phone.replace(/^0+/, '');
    
    if (existingNumbers.includes(normalizedPhone) || existingNumbers.includes(phone)) {
      addMessage('✅ Usuario verificado.', 'bot');
      setIsRegistered(true);
      addMainOptions();
    } else {
      addMessage('No encontramos tu usuario. ¿Deseas registrarte para avanzar?', 'bot');
      addRegisterAskOptions();
      setIsRegistered(false);
    }
  };

  // Simulación de retiro
  const handleWithdraw = async (monto, plataforma) => {
    await new Promise(res => setTimeout(res, 1000));
    addMessage(`💸 Retiro solicitado: $${monto} en ${plataforma}.`, 'bot');
    addMessage('🙌 Un asesor confirmará tu retiro en breve.', 'bot');
  };

  // Simulación de reclamo
  const handleComplaint = async (texto) => {
    await new Promise(res => setTimeout(res, 1000));
    addMessage('📩 Mensaje enviado. Estado: pendiente.', 'bot');
    addMessage('🙌 Un asesor se comunicará contigo a la brevedad.', 'bot');
  };

  // Simulación de historial
  const handleHistory = async () => {
    await new Promise(res => setTimeout(res, 1000));
    addMessage('📊 Movimientos recientes:', 'bot');
    addMessage('• Depósito: $500.00 — Estado: Completado', 'bot');
    addMessage('• Retiro: $200.00 — Estado: Pendiente', 'bot');
  };

  // Manejar Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`gestor-fichas ${theme} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} data-theme={theme}>
      <div className="container-fluid h-100">
        <div className="row h-100">
          {/* Sidebar */}
          <div className={`sidebar p-0 ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
              <div className="logo">
                <FontAwesomeIcon icon={faCoins} />
                {!sidebarCollapsed && <h1>Gestor de Fichas</h1>}
              </div>
              <div className="sidebar-controls">
                <button className="theme-toggle btn" onClick={toggleTheme} title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}>
                  <FontAwesomeIcon icon={theme == 'dark' ? faMoon : faSun} />
                </button>
                <button className="sidebar-toggle btn" onClick={toggleSidebar} title={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}>
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
                <button 
                  className="btn btn-primary mt-3" 
                  onClick={initializeChat}
                >
                  Iniciar Chat
                </button>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="chat-header">
                  {(sidebarCollapsed || isMobile) && (
                    <button className="sidebar-toggle-mobile btn me-2" onClick={toggleSidebar} title="Mostrar sidebar">
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

                {/* Messages Container */}
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

                {/* Input Container */}
                <div className="input-container">
                  <textarea
                    className="message-input flex-grow-1"
                    placeholder={inputPlaceholder()}
                    rows="1"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <button className="send-button" onClick={sendMessage}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </button>
                </div>

                {/* Acciones rápidas fijas */}
                {userPhone && isRegistered && !pendingAction && (
                  <div style={{ padding: '10px 20px 20px' }}>
                    <div className="action-buttons">
                      <button
                        className="action-btn"
                        onClick={() => handleQuickOption('retiro')}
                      >
                        Retiro
                      </button>
                      <button
                        className="action-btn secondary"
                        onClick={() => handleQuickOption('mensaje')}
                      >
                        Mensaje
                      </button>
                      <button
                        className="action-btn secondary"
                        onClick={() => handleQuickOption('historial')}
                      >
                        Historial
                      </button>
                      <button
                        className="action-btn secondary"
                        onClick={() => handleQuickOption('cancelar')}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatUser;