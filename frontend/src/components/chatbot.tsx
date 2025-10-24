import React, { useState, useRef, useEffect } from 'react';

const initialMessages = [
  { sender: 'bot', text: '¡Hola! Soy TalentBot. ¿En qué puedo ayudarte hoy?' }
];


export default function Chatbot() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cerrar el chat si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (open && chatRef.current && !chatRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    try {
  const API_URL = process.env.REACT_APP_API_URL || 'https://ingenieria-software-2025.vercel.app/api';
      const conversationHistory = messages
        .filter(m => m.sender !== 'bot')
        .map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));
      const res = await fetch(`${API_URL}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationHistory
        })
      });
      const data = await res.json();
      if (data.success && data.data?.response) {
        setMessages((msgs) => [
          ...msgs,
          { sender: 'bot', text: data.data.response }
        ]);
      } else {
        setMessages((msgs) => [
          ...msgs,
          { sender: 'bot', text: 'Hubo un problema con la respuesta de la IA.' }
        ]);
      }
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { sender: 'bot', text: 'Error de conexión con el servidor.' }
      ]);
    }
    setLoading(false);
  };

  // Botón circular minimizado
  if (!open) {
    return (
      <button
        className="fixed bottom-6 right-6 z-[9999] w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-2xl flex items-center justify-center text-white text-3xl font-bold hover:scale-105 transition-transform"
        style={{ fontFamily: 'Inter, Noto Sans, sans-serif' }}
        onClick={() => setOpen(true)}
        aria-label="Abrir chatbot"
      >
        <span className="animate-bounce">🤖</span>
      </button>
    );
  }

  return (
    <div ref={chatRef} className="fixed bottom-6 right-6 z-[9999] w-96 max-w-full shadow-2xl rounded-3xl bg-white/90 backdrop-blur border border-slate-200 flex flex-col anim-fade-in" style={{ fontFamily: 'Inter, Noto Sans, sans-serif' }}>
      <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex items-center gap-2 bg-gradient-to-r from-blue-600/80 to-purple-600/80 rounded-t-3xl">
        <span className="text-white text-2xl font-bold">TalentBot</span>
        <span className="ml-2 px-2 py-1 text-xs rounded bg-white/20 text-white font-medium">IA</span>
        <button
          className="ml-auto text-white hover:text-slate-200 text-xl p-1 rounded-full focus:outline-none"
          onClick={() => setOpen(false)}
          aria-label="Minimizar chatbot"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5"/></svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3" style={{ maxHeight: '340px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex items-center gap-2 px-6 py-4 border-t border-slate-100 bg-white rounded-b-3xl">
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
          placeholder="Escribe tu mensaje..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:scale-105 transition-transform"
          disabled={loading || !input.trim()}
        >
          {loading ? <span className="animate-spin">⏳</span> : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
