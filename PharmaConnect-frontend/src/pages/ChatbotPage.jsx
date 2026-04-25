import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/chatbot.css";

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your PharmaConnect assistant. How can I help you today?", sender: "bot", time: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
      const response = await fetch("${import.meta.env.VITE_API_URL}/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
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
    <div className="dashboard-container">
      <Sidebar activeMenu="chatbot" />
      <div className="dashboard-main">
        <Topbar />
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-header-icon">
              <Bot size={20} />
            </div>
            <div>
              <h2>PharmaConnect Assistant</h2>
              <p>Ask me anything about products, orders, or services</p>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                <div className="message-avatar">
                  {msg.sender === "bot" ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className="message-bubble">
                  <p>{msg.text}</p>
                  <span className="message-time">{formatTime(msg.time)}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message-wrapper bot">
                <div className="message-avatar">
                  <Bot size={16} />
                </div>
                <div className="message-bubble typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-container">
            <input
              type="text"
              className="chatbot-input"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              className="chatbot-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
