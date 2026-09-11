import React, { useState } from 'react';
import { X, Send, Bot, User } from 'lucide-react';

export default function DirectChatModal({ brand, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello! Welcome to official ${brand ? brand.name : 'Brand'} Live Warranty Support. How can we help you today?`
    }
  ]);
  const [input, setInput] = useState('');

  if (!brand) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: `Thanks for reaching out! A verified ${brand.name} service advisor has received your request regarding toll-free ${brand.phone} or ${brand.email}. How else can we assist your protection policy?`
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: brand.logoColor || '#2563eb',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.8rem'
              }}
            >
              {brand.logoText}
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {brand.name} Live Chat Support
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>● Online Now</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ height: '340px', overflowY: 'auto', background: '#ffffff', padding: '1rem' }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '0.8rem'
              }}
            >
              <div
                style={{
                  maxWidth: '80%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: m.sender === 'user' ? '#2563eb' : '#f1f5f9',
                  color: m.sender === 'user' ? '#ffffff' : '#1e293b',
                  fontSize: '0.88rem',
                  fontWeight: 500
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} style={{ borderTop: '1px solid #e2e8f0', padding: '0.75rem', display: 'flex', gap: '0.5rem', background: '#f8fafc' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Type your query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-icon">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
