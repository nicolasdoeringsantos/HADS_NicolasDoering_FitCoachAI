import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../pages/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";

type ChatMessage = {
  sender: "user" | "ai";
  text: string;
};

type ChatProps = {
  chatType: "dieta" | "treino";
  title: string;
  initialMessage: string;
  context: string;
  placeholder: string;
};

type MarkdownProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  node: unknown;
  children: React.ReactNode;
};

// Mapeia o tipo do chat para a tabela correta
const tableMap = {
  treino: "workout_chat_messages",
  dieta: "diet_chat_messages",
} as const;

// Busca histórico salvo no banco Supabase
const fetchDbHistory = async (chatType: "treino" | "dieta") => {
  const table = tableMap[chatType];
  
  // Garante que o usuário está logado antes de buscar
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from(table)
    .select("role, message")
    .eq("user_id", session.user.id) // <-- ADICIONE ESTA LINHA
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar histórico:", error);
    return [];
  }

  return data.map((row) => ({
    sender: row.role === "user" ? "user" : "ai",
    text: row.message,
  })) as ChatMessage[];
};

// Salva cada mensagem no banco Supabase
const saveDbMessage = async (
  chatType: "treino" | "dieta",
  sender: "user" | "ai",
  text: string
) => {
  const table = tableMap[chatType];
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  await supabase.from(table).insert({
    user_id: session.user.id,
    role: sender,
    message: text,
  });
};

const ChatComponent: React.FC<ChatProps> = ({
  chatType,
  title,
  initialMessage,
  context,
  placeholder,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();  
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  // Carregar histórico do banco
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const loadedMessages = await fetchDbHistory(chatType);

        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
        } else {
          setMessages([{ sender: "ai", text: initialMessage }]);
        }
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        setMessages([{ sender: "ai", text: "Erro ao carregar histórico." }]);
      }
      setIsLoading(false);
    };
    loadHistory();
  }, [chatType, initialMessage]);

  // Efeito para ouvir mudanças de tema em tempo real
  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ isDarkMode: boolean }>;
      setIsDarkMode(customEvent.detail.isDarkMode);
    };

    window.addEventListener('theme-changed', handleThemeChange);

    return () => {
      window.removeEventListener('theme-changed', handleThemeChange);
    };
  }, []);

  // Enviar mensagens
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { sender: "user", text: input };

    // Mostra mensagem imediatamente
    setMessages((prev) => [...prev, userMessage]);
    await saveDbMessage(chatType, "user", input);

    const promptText = input;
    setInput("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado.");

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`;

      const res = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt: promptText,
          context,
          chatType,
          history: [...messages, userMessage].map((msg) => ({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }],
          })),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const aiText = data.response;
        setMessages((prev) => [...prev, { sender: "ai", text: aiText }]);
        await saveDbMessage(chatType, "ai", aiText);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: data.error || "Erro desconhecido." },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Erro ao conectar ao servidor." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, chatType, context]);

  const handleSavePlan = async (planContent: string) => {
    const planName = prompt(`Dê um nome para este plano de ${chatType}:`);
    if (!planName) return; // User cancelled

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Você precisa estar logado para salvar um plano.");
        return;
      }

      const tableName = chatType === 'treino' ? 'saved_workouts' : 'saved_diets';
      const nameColumn = chatType === 'treino' ? 'workout_name' : 'diet_name';
      const contentColumn = chatType === 'treino' ? 'workout_content' : 'diet_content';

      const { error } = await supabase
        .from(tableName)
        .insert({
          user_id: session.user.id,
          [nameColumn]: planName,
          [contentColumn]: planContent,
        });

      if (error) throw error;

      alert(`Plano "${planName}" salvo com sucesso!`);
    } catch (err: any) {
      alert(`Falha ao salvar o plano: ${err.message}`);
    }
  };
  // Limpar chat no banco
  const handleClearChat = async () => {
    if (!confirm("Tem certeza que deseja limpar o chat?")) return;

    const table = tableMap[chatType];
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from(table).delete().eq("user_id", session.user.id);

    setMessages([{ sender: "ai", text: initialMessage }]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🎨 Estilos
    const colors = useMemo(() => ({
        bg: isDarkMode ? '#2D0D0D' : '#f0f4f8',
        cardBg: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : '#fff',
        text: isDarkMode ? '#f7fafc' : '#23272f',
        subtext: isDarkMode ? '#a0aec0' : '#666',
        border: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb',
        inputBg: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : '#fff',
        inputText: isDarkMode ? '#fff' : '#000',
        headerBg: isDarkMode ? '#B71C1C' : '#23272f',
        headerText: '#fff',
        primary: isDarkMode ? '#FFD600' : '#16a34a',
    }), [isDarkMode]);

    const markdownComponents = useMemo(() => ({
        ul: (props: MarkdownProps) => <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: '0.5rem 0' }} {...props} />,
        ol: (props: MarkdownProps) => <ol style={{ listStyleType: 'decimal', paddingLeft: '1.5rem', margin: '0.5rem 0' }} {...props} />,
        li: (props: MarkdownProps) => <li style={{ marginBottom: '0.25rem' }} {...props} />,
        // Garante que todos os links abram em uma nova aba
        a: (props: MarkdownProps) => <a target="_blank" rel="noopener noreferrer" {...props} style={{ color: isDarkMode ? '#FFD600' : '#16a34a', textDecoration: 'underline' }} />,
        p: (props: MarkdownProps) => <p style={{ margin: 0 }} {...props} />,
    }), []);

  return (
    <div style={{ height: "100vh", background: colors.bg, padding: '2rem 1rem', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column', background: isDarkMode ? '#2D0D0D' : '#fff', color: colors.text, borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
      {/* Cabeçalho */}  
        <div style={{ padding: '1rem 1.5rem', background: colors.headerBg, color: colors.headerText, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>
          ←
        </button>
        <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold' }}>{title}</h2>
        <button onClick={handleClearChat} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>
          🧹
        </button>
      </div>

      {/* Mensagens */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', gap: '0.75rem', animation: 'fadeIn 0.3s ease-out' }}>
            {msg.sender === 'ai' && (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: colors.headerBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: colors.primary }}>
                {chatType === 'treino' ? '🏋️' : '🍎'}
              </div>
            )}
            <div
              style={{
                padding: "0.75rem 1rem",
                background: msg.sender === 'user' ? colors.primary : colors.cardBg,
                color: msg.sender === 'user' ? (isDarkMode ? '#2D0D0D' : 'white') : colors.text,
                borderRadius: "0.75rem",
                maxWidth: "85%",
                borderBottomRightRadius: msg.sender === 'user' ? '0.125rem' : '0.75rem',
                borderBottomLeftRadius: msg.sender === 'ai' ? '0.125rem' : '0.75rem',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                border: `1px solid ${colors.border}`,
              }}
            >
                <ReactMarkdown children={msg.text} remarkPlugins={[remarkGfm]} components={markdownComponents} />
                {msg.sender === 'ai' && (chatType === 'treino' || chatType === 'dieta') && (
                    <button onClick={() => handleSavePlan(msg.text)} style={{ marginTop: '1rem', padding: '0.25rem 0.75rem', fontSize: '0.75rem', background: colors.primary, color: isDarkMode ? '#2D0D0D' : 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                        {chatType === 'treino' ? 'Salvar Treino' : 'Salvar Dieta'}
                    </button>
                )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '0.75rem', color: colors.subtext }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: colors.headerBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>...</div>
            <div style={{ alignSelf: 'center', fontStyle: 'italic' }}>Digitando...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
        <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', borderTop: `1px solid ${colors.border}`, background: isDarkMode ? 'transparent' : colors.cardBg, flexShrink: 0 }}>
        <input
          value={input}
          disabled={isLoading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: "0.75rem 1rem",
            borderRadius: "50px",
            border: `1px solid ${colors.border}`,
            background: colors.inputBg,
            color: colors.inputText,
            fontSize: '1rem',
          }}
        />
        <button
          disabled={isLoading}
          onClick={handleSend}
          style={{
            padding: "0.75rem 1.25rem",
            background: isLoading ? '#9ca3af' : colors.primary,
            color: isDarkMode ? '#2D0D0D' : 'white',
            borderRadius: "50px",
            border: "none",
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          Enviar
        </button>
      </div>
      </div>
    </div>
  );
};

export default ChatComponent;
