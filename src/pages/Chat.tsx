import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

interface ChatProps {
  chatType: 'treino' | 'dieta'; // Identificador do chat
}

// O tipo ChatMessage é usado para o estado do componente.
type ChatMessage = {
  sender: 'user' | 'ai';
  text: string;
};

const getChatContext = (chatType: 'treino' | 'dieta'): string => {
  if (chatType === 'dieta') {
    return `
      Você é o FitCoachAI, um assistente de fitness e saúde de classe mundial, com especialização em nutrição.
      Seu objetivo é ser um nutricionista e coach motivacional.
      Responda de forma amigável, encorajadora e informativa, sempre com foco em alimentação saudável.
      Sempre use as informações do perfil do usuário para personalizar suas respostas e planos alimentares.
      Se o usuário pedir um plano de dieta, crie algo estruturado, detalhado e balanceado, formatando em tabelas.
    `.trim();
  }
  // Contexto padrão para 'treino'
  return `
    Você é o FitCoachAI, um assistente de fitness e saúde de classe mundial.
    Seu objetivo é ser um personal trainer, nutricionista e coach motivacional.
    Responda de forma amigável, encorajadora e informativa.
    Sempre use as informações do perfil do usuário para personalizar suas respostas.
    Se o usuário pedir um plano de treino ou dieta, crie algo estruturado e detalhado.
  `.trim();
};

const Chat: React.FC<ChatProps> = ({ chatType }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Estados para o modal de salvar treino
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [contentToSave, setContentToSave] = useState('');
  const [savedItemName, setSavedItemName] = useState('');
  const [saveStatus, setSaveStatus] = useState<{ message: string; error: string }>({ message: '', error: '' });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const workoutNameInputRef = useRef<HTMLInputElement>(null);
  const [initialMessage] = useState('Olá! Sou o FitCoachAI, seu assistente de fitness pessoal. Como posso te ajudar a atingir seus objetivos hoje?');
  const navigate = useNavigate();

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          // Se não houver sessão, redireciona ou mostra mensagem de erro.
          // Por enquanto, apenas iniciamos com a mensagem padrão.
          setMessages([{ sender: "ai", text: initialMessage }]);
          return;
        }

        const { data, error } = await supabase
          .from('chat_messages')
          .select('role, message')
          .eq('user_id', session.user.id) // Filtra pelo usuário
          .eq('chat_type', chatType)      // Filtra pelo tipo de chat correto
          .order('created_at', { ascending: true });
        
        if (error) throw error;

        const loadedMessages = data.map(msg => ({
          sender: msg.role as 'user' | 'ai',
          text: msg.message, // Usa a mensagem diretamente, sem remover prefixo
        }));

        if (loadedMessages.length > 0) {
          // Se o histórico foi carregado, define as mensagens
          setMessages(loadedMessages);
        } else {
          // Se não houver histórico no banco, começa com a mensagem de boas-vindas
          setMessages([{ sender: "ai", text: initialMessage }]);
        }
      } catch (error) {
        console.error("Falha ao carregar histórico:", error);
        setMessages([{ sender: "ai", text: "Desculpe, não consegui carregar o histórico. Tente recarregar a página." }]);
      }
      setIsLoading(false);
    };
    loadHistory();
  }, [chatType, initialMessage]);

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

  // Efeito para gerenciar a acessibilidade do modal
  useEffect(() => {
    if (isSaveModalOpen) {
      // Move o foco para o input quando o modal abre
      workoutNameInputRef.current?.focus();

      // Adiciona um listener para fechar com a tecla 'Escape'
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsSaveModalOpen(false);
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSaveModalOpen]);


  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const promptText = input; // Guarda o texto antes de limpar o input
    setInput(''); // Limpa o input imediatamente

    const userMessage: ChatMessage = { sender: 'user', text: promptText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages); // Atualiza a UI imediatamente com a mensagem do usuário
    setIsLoading(true);
    
    try {
      const context = getChatContext(chatType);
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
        body: JSON.stringify({ 
          prompt: promptText, 
          context,
          chatType, // Passa o tipo de chat para a Edge Function saber qual perfil buscar
          // Envia o histórico formatado para a IA
          // Filtra a mensagem de boas-vindas inicial para não poluir o histórico da IA
          history: updatedMessages.slice(0, -1).filter(m => m.text !== initialMessage).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          })),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const aiMessage: ChatMessage = { sender: 'ai', text: data.response };
        setMessages(current => [...current, aiMessage]);
      } else {
        // Se a API retornar um erro, exibe a mensagem de erro da API para o usuário
        const errorText = data.error || 'Desculpe, ocorreu um erro ao processar sua solicitação.';
        const errorMessage: ChatMessage = { sender: 'ai', text: errorText };
        // Adiciona a mensagem de erro da IA ao chat para feedback visual
        setMessages(current => [...current, errorMessage]);
      }
    } catch (error: unknown) {
      let message = 'Não consegui me conectar ao servidor. Verifique sua internet e tente novamente.';
      if (error instanceof Error) {
        message = `Erro de conexão: ${error.message}`;
      }
      const networkError: ChatMessage = { sender: 'ai', text: message };
      // Adiciona a mensagem de erro de rede ao chat
      setMessages(current => [...current, networkError]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, chatType, initialMessage]);

  const handleSaveContent = useCallback(async () => {
    if (!savedItemName.trim() || !contentToSave.trim()) {
      setSaveStatus({ message: '', error: 'O nome do treino é obrigatório.' });
      return;
    }
    setSaveStatus({ message: 'Salvando...', error: '' });
  
    const isWorkout = chatType === 'treino';
    const tableName = isWorkout ? 'saved_workouts' : 'saved_diets';
    const contentToInsert = isWorkout 
      ? { workout_name: savedItemName, workout_content: contentToSave }
      : { diet_name: savedItemName, diet_content: contentToSave };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado.");
  
      const { error } = await supabase.from(tableName).insert({ ...contentToInsert, user_id: session.user.id });
  
      if (error) throw error;
  
      setSaveStatus({ message: `${isWorkout ? 'Treino' : 'Dieta'} salvo com sucesso!`, error: '' });
      setTimeout(() => setIsSaveModalOpen(false), 1500); // Fecha o modal após sucesso
  
    } catch (error: any) {
      setSaveStatus({ message: '', error: error.message || `Erro ao salvar ${isWorkout ? 'treino' : 'dieta'}.` });
    }
  }, [savedItemName, contentToSave, chatType]);

  const handleClearChat = useCallback(async () => {
    if (window.confirm('Tem certeza que deseja limpar todo o histórico deste chat?')) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        alert("Você precisa estar logado para limpar o histórico.");
        return;
      }

      await supabase.from('chat_messages')
        .delete()
        .eq('user_id', session.user.id)   // Garante que só apagamos mensagens do usuário logado
        .eq('chat_type', chatType);       // Apaga apenas as mensagens do tipo de chat correto


      // Mostra a mensagem de boas-vindas novamente após limpar
      setMessages([
        {
          sender: 'ai',
          text: initialMessage,
        },
      ]);
    }
  }, [chatType, initialMessage]);

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

  // Componentes para o ReactMarkdown, definidos fora do loop para melhor performance
  const markdownComponents = React.useMemo(() => ({
    h2: (props: React.ComponentProps<'h2'>) => <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: isDarkMode ? '#4ade80' : '#15803d', marginTop: '0.5rem', marginBottom: '0.25rem' }} {...props} />,
    h3: (props: React.ComponentProps<'h3'>) => <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: colors.text, marginTop: '0.25rem', marginBottom: '0.25rem' }} {...props} />,
    ul: (props: React.ComponentProps<'ul'>) => <ul style={{ listStyleType: 'disc', listStylePosition: 'inside', display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '1rem' }} {...props} />,
    table: (props: React.ComponentProps<'table'>) => <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${colors.border}`, marginTop: '0.5rem', marginBottom: '0.75rem' }} {...props} />,
    th: (props: React.ComponentProps<'th'>) => <th style={{ border: `1px solid ${colors.border}`, background: isDarkMode ? '#3f3f46' : '#f9fafb', padding: '0.25rem 0.5rem', textAlign: 'left', fontSize: '0.875rem' }} {...props} />,
    td: (props: React.ComponentProps<'td'>) => <td style={{ border: `1px solid ${colors.border}`, padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} {...props} />,
    blockquote: (props: React.ComponentProps<'blockquote'>) => <blockquote style={{ borderLeft: `4px solid ${colors.primary}`, paddingLeft: '0.75rem', fontStyle: 'italic', color: colors.subtext, marginTop: '0.5rem' }} {...props} />,
  }), [isDarkMode, colors.text, colors.border, colors.primary, colors.subtext]);

  // Encontra a última mensagem da IA que parece ser um conteúdo salvável (treino ou dieta).
  // Usamos useMemo para otimizar e não recalcular a cada renderização.
  const savableMessage = React.useMemo(() => {
    const keywords = chatType === 'treino'
      ? ['exercício', 'séries', 'repetições']
      : ['refeição', 'café da manhã', 'almoço', 'jantar', 'calorias', 'lanche'];

    return [...messages].reverse().find(msg => 
      msg.sender === 'ai' &&
      keywords.some(keyword => msg.text.toLowerCase().includes(keyword))
    );
  }, [messages, chatType]);

  // O botão é exibido se encontramos uma mensagem salvável e a IA não está digitando.
  const showSaveButton = !!savableMessage && !isLoading;
  const isSavingWorkout = chatType === 'treino';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: colors.bg, maxWidth: '800px', margin: '0 auto', border: `1px solid ${colors.border}`, borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
      {/* Modal para Salvar Treino */}
      {isSaveModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsSaveModalOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-modal-title" // O título do modal
            aria-describedby="save-modal-description" // A descrição do modal
            onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
            style={{ background: colors.cardBg, padding: '2rem', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <h3 id="save-modal-title" style={{ margin: 0, textAlign: 'center', color: colors.text }}>Salvar {isSavingWorkout ? 'Treino' : 'Dieta'}</h3>
            <p id="save-modal-description" style={{ margin: 0, textAlign: 'center', fontSize: '0.9rem', color: colors.subtext }}>Dê um nome para {isSavingWorkout ? 'o seu novo treino' : 'a sua nova dieta'}.</p>
            <input
              type="text"
              placeholder={isSavingWorkout ? "Ex: Treino de Pernas - Semana 1" : "Ex: Dieta Hipercalórica - Mês 1"}
              value={savedItemName}
              onChange={(e) => setSavedItemName(e.target.value)}
              ref={workoutNameInputRef}
              style={{ padding: '0.75rem', border: `1px solid ${colors.border}`, borderRadius: '0.5rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
            {saveStatus.error && <p style={{ color: '#d00', margin: 0, fontSize: '0.9rem', textAlign: 'center' }}>{saveStatus.error}</p>}
            {saveStatus.message && <p style={{ color: '#16a34a', margin: 0, fontSize: '0.9rem', textAlign: 'center' }}>{saveStatus.message}</p>}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={() => setIsSaveModalOpen(false)} style={{ flex: 1, padding: '0.75rem', border: '1px solid #ccc', background: '#f0f0f0', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSaveContent} style={{ flex: 1, padding: '0.75rem', border: 'none', background: colors.primary, color: 'white', borderRadius: '0.5rem', cursor: 'pointer' }}>Salvar</button>
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
        <button onClick={handleClearChat} title="Limpar chat" style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.25rem', cursor: 'pointer', width: '24px' }}>
          🧹
        </button>
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
                  components={markdownComponents}
                />
              </div>
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
        {showSaveButton && (
          <button
            onClick={() => {
              setContentToSave(savableMessage.text);
              setSavedItemName('');
              setSaveStatus({ message: '', error: '' });
              setIsSaveModalOpen(true);
            }}
            title={isSavingWorkout ? "Salvar Treino" : "Salvar Dieta"}
            style={{
              background: '#ffc107',
              color: 'black',
              padding: '0.5rem 1rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
            }}>📂 Salvar {isSavingWorkout ? 'Treino' : 'Dieta'}</button>
        )}
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