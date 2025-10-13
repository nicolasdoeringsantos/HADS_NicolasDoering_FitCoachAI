
import React, { useState } from 'react';
import  {supabase}  from './supabaseClient';

import './Chat.css';



interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface ChatProps {
  context: string; // Contexto para guiar a IA (ex: "Você é um personal trainer")
}

const Chat: React.FC<ChatProps> = ({ context }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado.");

      const res = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Adiciona o token de autenticação no header
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ prompt: input, context }),
      });

      const data = await res.json();

      if (res.ok) {
        const aiMessage: Message = { sender: 'ai', text: data.response };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.message || 'Erro na API');
      }
    } catch (error) {
      const errorMessage: Message = { sender: 'ai', text: 'Desculpe, não consegui responder agora. Tente novamente.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && <div className="message ai">Digitando...</div>}
      </div>
      <div className="chat-input-area">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Pergunte algo..." disabled={isLoading} />
        <button onClick={handleSend} disabled={isLoading}>Enviar</button>
      </div>
    </div>
  );
};

export default Chat;