import React, { useState, useRef, useEffect } from 'react';
import  {supabase}  from './supabaseClient';
import { useNavigate } from 'react-router-dom';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface ChatProps {
  context: string; // Contexto para guiar a IA (ex: "Você é um personal trainer")
}

const Chat: React.FC<ChatProps> = ({ context }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Mensagem de boas-vindas inicial da IA
    setMessages([
      {
        sender: 'ai',
        text: 'Olá! Sou o FitCoachAI, seu assistente de fitness pessoal. Como posso te ajudar a atingir seus objetivos hoje?',
      },
    ]);
  }, []); // O array vazio garante que isso rode apenas uma vez, quando o componente montar.

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    // Adiciona a mensagem do usuário e limpa o input
    setMessages(currentMessages => [...currentMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado.");

      // Aponta para a sua Edge Function do Supabase
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`;

      const res = await fetch(functionUrl, {
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
        setMessages(currentMessages => [...currentMessages, aiMessage]);
      } else {
        // Se a API retornar um erro, exibe a mensagem de erro da API
        const errorMessage: Message = { sender: 'ai', text: data.error || 'Desculpe, ocorreu um erro na resposta.' };
        setMessages(currentMessages => [...currentMessages, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = { sender: 'ai', text: 'Desculpe, não consegui responder agora. Tente novamente.' };
      setMessages(currentMessages => [...currentMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Este useEffect agora cuida de rolar a tela para a última mensagem
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f2f4f8' }}>
      <header style={{
        background: '#23272f',
        color: '#fff',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ color: '#fff', textDecoration: 'none', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          &larr; Voltar
        </button>
        <h1 style={{ fontSize: 20, margin: 0 }}>FitCoach AI</h1>
        <div style={{ width: 50 }} />
      </header>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((msg, index) => (
            <div key={index} style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              background: msg.sender === 'user' ? '#007bff' : '#fff',
              color: msg.sender === 'user' ? '#fff' : '#333',
              padding: '10px 15px',
              borderRadius: '18px',
              maxWidth: '70%',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              {msg.text}
            </div>
          ))}
          {isLoading && <div style={{ alignSelf: 'flex-start', background: '#fff', color: '#333', padding: '10px 15px', borderRadius: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>Digitando...</div>}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div style={{ padding: '16px', background: '#fff', borderTop: '1px solid #ddd' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '10px' }}>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Pergunte algo para o FitCoach AI..." disabled={isLoading} style={{ flex: 1, padding: '12px', borderRadius: '20px', border: '1px solid #ccc', fontSize: '16px' }} />
          <button onClick={handleSend} disabled={isLoading} style={{ padding: '12px 20px', borderRadius: '20px', border: 'none', background: '#007bff', color: '#fff', fontSize: '16px', cursor: 'pointer' }}>Enviar</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;