import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../pages/supabaseClient";
import { useNavigate } from "react-router-dom";
import { getChatHistory, clearChatHistory as clearRemoteHistory } from "../pages/chatStorage";

type ChatMessage = {
  sender: 'user' | 'ai';
  text: string;
};

type ChatProps = {
  chatType: 'dieta' | 'treino';
  title: string;
  initialMessage: string;
  context: string;
  placeholder: string;
};

const ChatComponent: React.FC<ChatProps> = ({ chatType, title, initialMessage, context, placeholder }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const navigate = useNavigate();

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const loadedMessages = await getChatHistory(chatType);
        const initialMsgObject = { sender: "ai" as const, text: initialMessage };
        setMessages(loadedMessages.length > 0 ? [initialMsgObject, ...loadedMessages] : [initialMsgObject]);
      } catch (error) {
        console.error(`Falha ao carregar histórico de ${chatType}:`, error);
        setMessages([{ sender: "ai", text: "Desculpe, não consegui carregar o histórico." }]);
      }
      setIsLoading(false);
    };
    loadHistory();
  }, [initialMessage, chatType]);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    const promptText = input;
    setInput('');
    const userMessage: ChatMessage = { sender: 'user', text: promptText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado.");

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`;
      const res = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
  prompt: promptText, 
  context,
  chatType, 
  table: chatType === 'dieta' ? 'diet_chat_messages' : 'workout_chat_messages',
  history: updatedMessages.slice(0, -1).filter(m => m.text !== initialMessage).map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  })),
}),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages(current => [...current, { sender: 'ai', text: data.response }]);
      } else {
        setMessages(current => [...current, { sender: 'ai', text: data.error || 'Desculpe, ocorreu um erro.' }]);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? `Erro de conexão: ${error.message}` : 'Não consegui me conectar ao servidor.';
      setMessages(current => [...current, { sender: 'ai', text: message }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, initialMessage, chatType, context]);

  const handleSavePlan = async (planContent: string) => {
    const planName = prompt(`Dê um nome para este plano de ${chatType}:`);
    if (!planName || !planName.trim()) {
      alert("O nome do plano não pode ser vazio.");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado para salvar o plano.");

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/super-handler`;
      const res = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
  planName: planName.trim(),
  planContent,
  planType: chatType,
  role:"ai",
  table: chatType === 'dieta' ? 'diet_chat_messages' : 'workout_chat_messages',
}),
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok) throw new Error(data.error || 'Falha ao salvar o plano.');

      alert(`Plano "${planName.trim()}" salvo com sucesso!`);
    } catch (error) {
      console.error("Erro ao salvar plano:", error);
      alert(error instanceof Error ? error.message : "Ocorreu um erro desconhecido ao salvar.");
    }
  };

  const handleClearChat = useCallback(async () => {
    if (window.confirm(`Tem certeza que deseja limpar o histórico de ${chatType}?`)) {
      await clearRemoteHistory(chatType);
      setMessages([{ sender: 'ai', text: initialMessage }]);
    }
  }, [initialMessage, chatType]);

  useEffect(() => {
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
    headerBg: '#23272f',
    headerText: '#fff',
    primary: '#22c55e',
  };

  const markdownComponents = React.useMemo(() => ({
    h2: (props: any) => <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: isDarkMode ? '#4ade80' : '#15803d', marginTop: '0.5rem', marginBottom: '0.25rem' }} {...props} />,
    table: (props: any) => <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${colors.border}`, marginTop: '0.5rem', marginBottom: '0.75rem' }} {...props} />,
    th: (props: any) => <th style={{ border: `1px solid ${colors.border}`, background: isDarkMode ? '#3f3f46' : '#f9fafb', padding: '0.25rem 0.5rem', textAlign: 'left', fontSize: '0.875rem' }} {...props} />,
    td: (props: any) => <td style={{ border: `1px solid ${colors.border}`, padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} {...props} />,
  }), [isDarkMode, colors]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', background: colors.bg, maxWidth: '800px', margin: '0 auto', border: `1px solid ${colors.border}`, borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
      {/* Cabeçalho adicionado */}
      <div style={{ background: colors.headerBg, color: colors.headerText, padding: '1rem 1.5rem', textAlign: 'center', borderTopLeftRadius: '0.75rem', borderTopRightRadius: '0.75rem', fontSize: '1.125rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>
          &larr;
        </button>
        <span style={{ flex: 1, textAlign: 'center' }}>{title}</span>
        <button onClick={handleClearChat} title="Limpar chat" style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.25rem', cursor: 'pointer', width: '24px' }}>
          🧹
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', width: '100%', margin: '0 auto' }}>
          {messages.map((msg, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ padding: '0.75rem', borderRadius: '0.75rem', maxWidth: '80%', background: msg.sender === 'user' ? colors.primary : colors.cardBg, color: msg.sender === 'user' ? 'white' : colors.text, border: msg.sender === 'ai' ? `1px solid ${colors.border}` : 'none', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', borderBottomRightRadius: msg.sender === 'user' ? '0' : '0.75rem', borderBottomLeftRadius: msg.sender === 'ai' ? '0' : '0.75rem' }}>
                <ReactMarkdown children={msg.text} remarkPlugins={[remarkGfm]} components={markdownComponents} />
                {msg.sender === 'ai'  && (
                  <button onClick={() => handleSavePlan(msg.text)} style={{ marginTop: '1rem', padding: '0.25rem 0.75rem', fontSize: '0.75rem', background: colors.primary, color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                    💾 Salvar Plano
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '0.75rem', background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: '0.75rem', color: colors.subtext }}>Digitando...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: '1rem', borderTop: `1px solid ${colors.border}`, background: colors.cardBg, borderBottomLeftRadius: '0.75rem', borderBottomRightRadius: '0.75rem', display: 'flex', gap: '0.5rem' }}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder} style={{ flex: 1, border: `1px solid ${colors.border}`, borderRadius: '0.75rem', padding: '0.5rem 1rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }} onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()} disabled={isLoading} />
        <button onClick={handleSend} disabled={isLoading} style={{ background: isLoading ? '#9ca3af' : colors.primary, color: 'white', padding: '0.5rem 1rem', borderRadius: '0.75rem', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer' }}>Enviar</button>
      </div>
    </div>
  );
};

export default ChatComponent;