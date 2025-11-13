import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../supabaseClient.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Salva uma ou mais mensagens de chat no banco de dados Supabase.
 * @param {string} userId - O ID do usuário.
 * @param {'user' | 'ai'} role - A função de quem enviou a mensagem.
 * @param {string} message - O conteúdo da mensagem.
 */
const saveChatMessage = async (userId, role, message) => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        role: role,
        message: message,
      });

    if (error) throw error;
  } catch (error) {
    // Apenas registra o erro no console, sem interromper o fluxo principal.
    console.error('Erro ao salvar mensagem no Supabase:', error.message);
  }
};
export const generateChatResponse = async (req, res) => {
  const { prompt, context } = req.body;
  const userId = req.userId; // ID do usuário vindo do middleware de autenticação

  if (!prompt) {
    return res.status(400).json({ message: "O prompt é obrigatório." });
  }

  try {
    // 1. Buscar os dados do usuário no banco de dados
    const { data: userData, error: userFetchError } = await supabase
      .from('Users_data')
      .select('username, nome, idade, sexo, altura, peso, nivel, experiencia, objetivo, restricao')
      .eq('id', userId)
      .single();

    if (userFetchError) {
      // Lançar erro se não for o caso de "nenhum resultado encontrado"
      if (userFetchError.code !== 'PGRST116') {
        throw new Error('Erro ao buscar dados do usuário.');
      }
    }

    // 2. Construir um prompt mais detalhado com os dados do usuário
    const userProfileContext = userData ? `
      Aqui estão os dados do usuário com quem você está conversando:
      - Nome: ${userData.nome || 'Não informado'}
      - Idade: ${userData.idade || 'Não informada'}
      - Sexo: ${userData.sexo || 'Não informado'}
      - Altura: ${userData.altura || 'Não informada'} cm
      - Peso: ${userData.peso || 'Não informado'} kg
      - Objetivo principal: ${userData.objetivo || 'Não informado'}
      - Nível de experiência com treinos: ${userData.experiencia || 'Não informado'}
      - Restrições de saúde: ${userData.restricao || 'Nenhuma'}
      Use essas informações para personalizar suas respostas.
    ` : 'O usuário ainda não preencheu o perfil. Responda de forma genérica.';

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const fullPrompt = `${context}\n\n${userProfileContext}\n\nUsuário: ${prompt}\n\nFitCoachAI:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // === IMPLEMENTAÇÃO DO SALVAMENTO NO SUPABASE ===
    // Salva a mensagem do usuário e a resposta da IA de forma assíncrona.
    await saveChatMessage(userId, 'user', prompt);
    await saveChatMessage(userId, 'ai', text);
    // ===============================================

    res.json({ response: text });
  } catch (error) {
    res.status(500).json({ message: "Erro ao gerar resposta da IA.", error: error.message });
  }
};

export const getDailyMessage = async (req, res) => {
  const userId = req.userId;

  try {
    // 1. Verifica se já existe uma mensagem para o usuário hoje
    const today = new Date().toISOString().slice(0, 10); // Formato YYYY-MM-DD

    const { data: existingMessage, error: existingError } = await supabase
      .from('daily_messages')
      .select('message')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lte('created_at', `${today}T23:59:59.999Z`)
      .single();

    if (existingMessage) {
      return res.json({ message: existingMessage.message });
    }

    // 2. Se não existe, busca os dados do usuário para personalizar a mensagem
    const { data: userData, error: userError } = await supabase
      .from('Users_data')
      .select('nome, objetivo')
      .eq('id', userId)
      .single();

    if (userError) throw new Error('Usuário não encontrado para gerar mensagem.');

    // 3. Gera uma nova mensagem com a IA
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Gere uma mensagem motivacional curta e inspiradora (no máximo 3 frases) para ${userData.nome || 'um usuário'} que está focado em seu objetivo de "${userData.objetivo || 'melhorar a saúde'}". A mensagem deve ser positiva e encorajadora.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const newMessage = response.text();

    // 4. Salva a nova mensagem no banco de dados
    const { error: insertError } = await supabase
      .from('daily_messages')
      .insert({ user_id: userId, message: newMessage });

    if (insertError) {
      // Não bloqueia o usuário se houver falha ao salvar, apenas loga o erro
      console.error('Falha ao salvar mensagem diária:', insertError);
    }

    res.json({ message: newMessage });

  } catch (error) {
    res.status(500).json({ message: "Erro ao gerar mensagem diária.", error: error.message });
  }
};