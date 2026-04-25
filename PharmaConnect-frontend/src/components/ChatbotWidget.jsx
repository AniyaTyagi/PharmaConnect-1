import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, X, MessageCircle } from "lucide-react";
import "../styles/chatbot-widget.css";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || '{}');
  const role = user.role || "buyer";
  
  const getInitialMessages = () => {
    const stored = localStorage.getItem(`chatbot_messages_${role}`);
    if (stored) {
      return JSON.parse(stored).map(msg => ({
        ...msg,
        time: new Date(msg.time)
      }));
    }
    return [
      { id: 1, text: "Hello! I'm your PharmaConnect assistant. How can I help you today?", sender: "bot", time: new Date() }
    ];
  };

  const [messages, setMessages] = useState(getInitialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`chatbot_messages_${role}`, JSON.stringify(messages));
  }, [messages, role]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
      time: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || '{}');
      const role = user.role || "buyer";

      const response = await fetch("${import.meta.env.VITE_API_URL}/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, role: role })
      });

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        text: data.reply || "Sorry, I couldn't process that request.",
        sender: "bot",
        time: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: "bot",
        time: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-widget">
          <div className="chatbot-widget-header">
            <div className="chatbot-widget-header-content">
              <div className="chatbot-widget-avatar">
                <Bot size={18} />
              </div>
              <div>
                <h3>PharmaConnect Assistant</h3>
                <p>Online</p>
              </div>
            </div>
            <button className="chatbot-widget-close" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="chatbot-widget-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`widget-message ${msg.sender}`}>
                <div className="widget-message-bubble">
                  <p>{msg.text}</p>
                  <span className="widget-message-time">{formatTime(msg.time)}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="widget-message bot">
                <div className="widget-message-bubble typing">
                  <div className="widget-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-widget-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={sendMessage} disabled={!input.trim() || isTyping}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button className="chatbot-widget-button" onClick={() => setIsOpen(true)}>
          <MessageCircle size={24} />
        </button>
      )}
    </>
  );
};

export default ChatbotWidget;
