import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "./supabaseClient";
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
  // Estados para o modal de salvar treino
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [workoutToSave, setWorkoutToSave] = useState('');
  const [workoutName, setWorkoutName] = useState('');
  const [saveStatus, setSaveStatus] = useState({ message: '', error: '' });
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  // Efeito para carregar e aplicar o modo noturno
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedMode);
    if (savedMode) {
      document.body.style.backgroundColor = '#1a1a1a';
    } else {
      document.body.style.backgroundColor = '#f2f4f8';
    }
  }, []);


  const handleSend = async () => {
    if (!input.trim()) return;

    const promptText = input; // Guarda o texto antes de limpar o input
    const userMessage: Message = { sender: 'user', text: promptText };
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
        body: JSON.stringify({ prompt: promptText, context }),
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
    } catch (error: any) {
      const errorMessage: Message = { sender: 'ai', text: error.message || 'Desculpe, não consegui responder agora. Tente novamente.' };
        setMessages(currentMessages => [...currentMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWorkout = async () => {
    if (!workoutName.trim() || !workoutToSave.trim()) {
      setSaveStatus({ message: '', error: 'O nome do treino é obrigatório.' });
      return;
    }
    setSaveStatus({ message: 'Salvando...', error: '' });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado.");

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-workout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ workout_name: workoutName, workout_content: workoutToSave }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao salvar.');

      setSaveStatus({ message: 'Treino salvo com sucesso!', error: '' });
      setTimeout(() => setIsSaveModalOpen(false), 1500); // Fecha o modal após sucesso

    } catch (error: any) {
      setSaveStatus({ message: '', error: error.message });
    }
  };

  useEffect(() => {
    // Este useEffect agora cuida de rolar a tela para a última mensagem
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const colors = {
    bg: isDarkMode ? '#1a1a1a' : '#f2f4f8',
    cardBg: isDarkMode ? '#2c2c2c' : '#fff',
    text: isDarkMode ? '#e5e5e5' : '#23272f',
    subtext: isDarkMode ? '#a0a0a0' : '#666',
    border: isDarkMode ? '#444' : '#e5e7eb',
    inputBg: isDarkMode ? '#333' : '#fff',
    inputText: isDarkMode ? '#fff' : '#000',
    headerBg: '#23272f', // Mantém o header escuro em ambos os modos
    headerText: '#fff',
    primary: '#22c55e',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: colors.bg, maxWidth: '800px', margin: '0 auto', border: `1px solid ${colors.border}`, borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
      {/* Modal para Salvar Treino */}
      {isSaveModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: colors.cardBg, padding: '2rem', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0, textAlign: 'center', color: colors.text }}>Salvar Treino</h3>
            <p style={{ margin: 0, textAlign: 'center', fontSize: '0.9rem', color: colors.subtext }}>Dê um nome para o seu novo treino.</p>
            <input
              type="text"
              placeholder="Ex: Treino de Pernas - Semana 1"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              style={{ padding: '0.75rem', border: `1px solid ${colors.border}`, borderRadius: '0.5rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
            {saveStatus.error && <p style={{ color: '#d00', margin: 0, fontSize: '0.9rem', textAlign: 'center' }}>{saveStatus.error}</p>}
            {saveStatus.message && <p style={{ color: '#16a34a', margin: 0, fontSize: '0.9rem', textAlign: 'center' }}>{saveStatus.message}</p>}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={() => setIsSaveModalOpen(false)} style={{ flex: 1, padding: '0.75rem', border: '1px solid #ccc', background: '#f0f0f0', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSaveWorkout} style={{ flex: 1, padding: '0.75rem', border: 'none', background: colors.primary, color: 'white', borderRadius: '0.5rem', cursor: 'pointer' }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <div style={{ background: colors.headerBg, color: colors.headerText, padding: '1rem 1.5rem', textAlign: 'center', borderTopLeftRadius: '0.75rem', borderTopRightRadius: '0.75rem', fontSize: '1.125rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>
          &larr;
        </button>
        <span style={{ flex: 1, textAlign: 'center' }}>🧠 FitCoachAI Chat</span>
        <div style={{ width: '24px' }}></div> {/* Espaçador */}
      </div>

      {/* Mensagens */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                padding: '0.75rem',
                borderRadius: '0.75rem',
                maxWidth: '80%',
                background: msg.sender === 'user' ? colors.primary : colors.cardBg,
                color: msg.sender === 'user' ? 'white' : colors.text,
                border: msg.sender === 'ai' ? `1px solid ${colors.border}` : 'none',
                boxShadow: msg.sender === 'ai' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none',
                borderBottomRightRadius: msg.sender === 'user' ? '0' : '0.75rem',
                borderBottomLeftRadius: msg.sender === 'ai' ? '0' : '0.75rem',
              }}>
                <ReactMarkdown
                  children={msg.text}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({ node, ...props }) => <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#16a34a', marginTop: '0.5rem', marginBottom: '0.25rem' }} {...props} />,
                    h3: ({ node, ...props }) => <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151', marginTop: '0.25rem', marginBottom: '0.25rem' }} {...props} />,
                    ul: ({ node, ...props }) => <ul style={{ listStyleType: 'disc', listStylePosition: 'inside', display: 'flex', flexDirection: 'column', gap: '0.25rem' }} {...props} />,
                    table: ({ node, ...props }) => <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d1d5db', marginTop: '0.5rem', marginBottom: '0.75rem' }} {...props} />,
                    th: ({ node, ...props }) => <th style={{ border: '1px solid #d1d5db', background: '#f9fafb', padding: '0.25rem 0.5rem', textAlign: 'left', fontSize: '0.875rem' }} {...props} />,
                    td: ({ node, ...props }) => <td style={{ border: '1px solid #d1d5db', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote style={{ borderLeft: '4px solid #6ee7b7', paddingLeft: '0.75rem', fontStyle: 'italic', color: '#4b5563', marginTop: '0.5rem' }} {...props} />,
                  }}
                />
              </div>
              {msg.sender === 'ai' && msg.text.includes('|') && ( // Mostra o botão se a mensagem da IA parece uma tabela (contém '|')
                <button
                  onClick={() => {
                    setWorkoutToSave(msg.text);
                    setWorkoutName('');
                    setSaveStatus({ message: '', error: '' });
                    setIsSaveModalOpen(true);
                  }}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.8rem',
                    background: '#e0e0e0', border: 'none', borderRadius: '0.5rem', cursor: 'pointer'
                  }}>Salvar Treino</button>
              )}
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '0.75rem', background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: '0.75rem', color: colors.subtext }}>
                Digitando...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '1rem', borderTop: `1px solid ${colors.border}`, background: colors.cardBg, borderBottomLeftRadius: '0.75rem', borderBottomRightRadius: '0.75rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          style={{
            flex: 1,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            background: colors.inputBg,
            color: colors.inputText,
          }}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          style={{
            background: isLoading ? '#9ca3af' : colors.primary,
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.75rem',
            transition: 'background-color 0.2s',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Chat;