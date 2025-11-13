import { supabase } from './supabaseClient';

export type ChatType = 'treino' | 'dieta';
export type ChatMessage = {
  sender: 'user' | 'ai';
  text: string;
}

/**
 * Salva uma nova mensagem no histórico de chat do usuário no Supabase, filtrando por tipo de chat.
 * @param role - Quem enviou a mensagem ('user' ou 'ai').
 * @param text - O conteúdo da mensagem.
 * @param chatType - O tipo de chat ('treino' ou 'dieta').
 */
export const saveMessage = async (role: 'user' | 'ai', text: string, chatType: ChatType): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    console.error('Usuário não autenticado. Não foi possível salvar a mensagem.');
    return;
  }

  const { error } = await supabase.from('chat_messages').insert({
      user_id: session.user.id,
      role,
      message: text,
      chat_type: chatType,
    });

  if (error) {
    console.error('Erro ao salvar mensagem no Supabase:', error);
  }
};

/**
 * Sincroniza mensagens antigas (locais) com o Supabase, evitando duplicatas.
 * Ideal para migrar um histórico pré-existente para o banco de dados.
 * @param localMessages - Array de mensagens do estado local do React.
 * @param chatType - O tipo de chat a ser sincronizado ('treino' ou 'dieta').
 */
export const syncOldMessages = async (localMessages: ChatMessage[], chatType: ChatType): Promise<void> => {
  console.log('[SYNC] Iniciando sincronização de mensagens antigas...');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    console.error('[SYNC] Usuário não autenticado. Sincronização cancelada.');
    return;
  }

  // 1. Busca todas as mensagens já salvas no banco para este chat
  const { data: remoteMessages, error: fetchError } = await supabase
    .from('chat_messages')
    .select('message, role')
    .eq('user_id', session.user.id)
    .eq('chat_type', chatType);

  if (fetchError) {
    console.error('[SYNC] Erro ao buscar mensagens remotas:', fetchError);
    return;
  }

  // 2. Cria um Set com as mensagens remotas para busca rápida (O(1))
  const remoteMessageSet = new Set(remoteMessages.map((m: { role: string; message: string }) => `${m.role}::${m.message}`));
  const welcomeMessage = "Olá! Sou o FitCoachAI, seu assistente de fitness pessoal. Como posso te ajudar a atingir seus objetivos hoje?";

  // 3. Filtra as mensagens locais que ainda não existem no banco
  const messagesToSave = localMessages
    .filter(msg => msg.text !== welcomeMessage) // Ignora a mensagem de boas-vindas
    .filter(msg => !remoteMessageSet.has(`${msg.sender}::${msg.text}`)) // Verifica se já não existe
    .map(msg => ({
      user_id: session.user.id,
      role: msg.sender,
      message: msg.text,
      chat_type: chatType,
    }));

  if (messagesToSave.length > 0) {
    console.log(`[SYNC] Encontradas ${messagesToSave.length} mensagens para salvar. Enviando...`);
    await supabase.from('chat_messages').insert(messagesToSave);
  } else {
    console.log('[SYNC] Nenhuma mensagem nova para sincronizar.');
  }
};

/**
 * Carrega o histórico de um tipo de chat específico do usuário autenticado.
 * @param chatType - O tipo de chat a ser carregado ('treino' ou 'dieta').
 * @returns Um array de mensagens ou um array vazio em caso de erro/sem histórico.
 */
export const getChatHistory = async (chatType: ChatType): Promise<ChatMessage[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    console.error('Usuário não autenticado. Não foi possível carregar o histórico.');
    return [];
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .select('role, message')
    .eq('chat_type', chatType)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao carregar histórico do Supabase:', error);
    return [];
  }

  // Mapeia os dados do Supabase para o formato esperado pelo componente Chat
  return data.map((item: { role: string; message: string }) => ({ sender: item.role as 'user' | 'ai', text: item.message }));
};

/**
 * Limpa o histórico de um tipo de chat específico do usuário autenticado.
 * @param chatType - O tipo de chat a ser limpo ('treino' ou 'dieta').
 */
export const clearChatHistory = async (chatType: ChatType): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    console.error('Usuário não autenticado. Não foi possível limpar o histórico.');
    return;
  }

  const { error } = await supabase.from('chat_messages').delete().eq('user_id', session.user.id).eq('chat_type', chatType);

  if (error) console.error('Erro ao limpar histórico:', error);
};