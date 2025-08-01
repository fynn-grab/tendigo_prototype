// src/components/common/ChatbotPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { askChatbot } from '../../services/api';
import styles from './ChatbotPanel.module.css';
import commonStyles from './Common.module.css';
import { Send, MessageSquareText, Loader2, AlertTriangle, ChevronRight } from 'lucide-react';

const ChatbotPanel = ({ isOpen, onClose, procurementId, procurementTitle }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const panelRef = useRef(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen && procurementId) {
      setMessages([{ sender: 'bot', text: `Spezifische Fragen zu "${procurementTitle || 'dieser Ausschreibung'}"? Ich helfe Ihnen gerne weiter.` }]);
      setInputValue(''); setError(null);
    }
    panelRef.current?.classList.toggle(styles.panelOpen, isOpen);
  }, [isOpen, procurementId, procurementTitle]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const userMessage = { sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue(''); setIsLoading(true); setError(null);
    try {
      const response = await askChatbot(procurementId, userMessage.text);
      const botResponseText = response?.answer || (response?.error ? `Fehler: ${response.error}` : "Problem bei der Beantwortung.");
      if (response?.error) setError(response.error);
      setMessages(prev => [...prev, { sender: 'bot', text: botResponseText }]);
    } catch (apiError) {
      console.error("Chatbot API-Aufruf fehlgeschlagen:", apiError);
      const errorMessage = "Kommunikationsfehler mit dem Assistenten.";
      setMessages(prev => [...prev, { sender: 'bot', text: errorMessage }]);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={panelRef} className={`${styles.chatbotPanelContainer} ${isOpen ? styles.panelOpen : ''}`}>
      <div className={styles.panelHeader}>
        <MessageSquareText size={20} className={styles.headerIcon} />
        <h3>Detail-Assistent</h3>
        <button onClick={onClose} className={styles.collapseButton} title="Chat schließen">
          <ChevronRight size={22} />
        </button>
      </div>
      {procurementId && (
        <div className={styles.procurementContextInfo}>
          <p><span>Thema:</span> {procurementTitle || "Ausgewählte Ausschreibung"}</p>
          <p><span>ID:</span> {procurementId}</p>
        </div>
      )}
      <div className={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${styles[msg.sender]}`}>
            <div className={styles.messageBubble}>{msg.text}</div>
          </div>
        ))}
        {isLoading && <div className={`${styles.message} ${styles.bot}`}><div className={styles.messageBubble}><Loader2 size={18} className="animate-spin" /> Bearbeite Anfrage...</div></div>}
        {error && !isLoading && <div className={`${styles.message} ${styles.error}`}><AlertTriangle size={16} /> {error}</div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className={styles.inputForm}>
        <input
          type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ihre Frage an den Assistenten..." className={styles.inputField}
          disabled={isLoading || !procurementId}
        />
        <button type="submit" className={`${commonStyles.buttonPrimary} ${styles.sendButton}`} disabled={isLoading || !inputValue.trim() || !procurementId}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
export default ChatbotPanel;