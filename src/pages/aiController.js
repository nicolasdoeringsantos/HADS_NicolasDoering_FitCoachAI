// Importa as bibliotecas necessárias: GoogleGenerativeAI para interagir com a IA e supabase para o banco de dados.
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../supabaseClient.js";

// Inicializa o cliente da IA Generativa do Google com a chave da API, que está nas variáveis de ambiente.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Salva uma ou mais mensagens de chat no banco de dados Supabase.
 * @param {string} userId - O ID do usuário.
 * @param {'user' | 'ai'} role - A função de quem enviou a mensagem ('user' para usuário, 'ai' para a inteligência artificial).
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

// Função exportada para gerar uma resposta de chat. É uma rota de API.
export const generateChatResponse = async (req, res) => {
  // Extrai o 'prompt' (a pergunta do usuário) e o 'context' (instruções para a IA) do corpo da requisição.
  // Adicionamos 'history' e 'isRegeneration' para o feedback.
  const { prompt, context, history, isRegeneration } = req.body;
  // Pega o ID do usuário que foi adicionado à requisição pelo middleware de autenticação.
  const userId = req.userId; // ID do usuário vindo do middleware de autenticação

  // Validação para garantir que o prompt não está vazio (a menos que seja uma regeneração).
  if (!prompt && !isRegeneration) {
    return res.status(400).json({ message: "O prompt é obrigatório." });
  }

  try {
    // 1. Busca os dados do perfil do usuário no banco de dados para personalizar a resposta.
    const { data: userData, error: userFetchError } = await supabase
      .from('Users_data')
      .select('username, nome, idade, sexo, altura, peso, nivel, experiencia, objetivo, restricao')
      .eq('id', userId)
      .single();

    if (userFetchError) {
      // Se houver um erro e não for porque o usuário ainda não tem perfil, lança uma exceção.
      if (userFetchError.code !== 'PGRST116') {
        throw new Error('Erro ao buscar dados do usuário.');
      }
    }

    // 2. Constrói um contexto adicional com os dados do perfil do usuário.
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

    // 3. Monta o prompt para a IA.
    // Inicializa o modelo de IA (gemini-pro).
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let fullPrompt;

    // Se for um pedido de regeneração, o prompt será diferente.
    if (isRegeneration && history && history.length > 0) {
      // Constrói o prompt com base no histórico, pedindo uma resposta melhor.
      const historyText = history.map(msg => `${msg.role === 'user' ? 'Usuário' : 'FitCoachAI'}: ${msg.message}`).join('\n');
      fullPrompt = `${context}\n\n${userProfileContext}\n\n${historyText}\n\nFitCoachAI: A resposta anterior não foi útil. Por favor, gere uma resposta nova e melhorada para a última pergunta do usuário.`;
    } else {
      // Monta o prompt padrão para uma nova pergunta.
      fullPrompt = `${context}\n\n${userProfileContext}\n\nUsuário: ${prompt}\n\nFitCoachAI:`;
    }

    // Gera o conteúdo com base no prompt completo.
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Só salva a mensagem do usuário se não for uma regeneração.
    if (!isRegeneration) {
      await saveChatMessage(userId, 'user', prompt);
    }
    
    // Salva (ou eventualmente atualiza) a resposta da IA.
    // Para uma regeneração, o ideal seria atualizar a mensagem anterior, mas por simplicidade, vamos salvar como uma nova.
    // Se você quiser atualizar, precisaria do ID da mensagem ruim para fazer um `update` em vez de `insert`.
    await saveChatMessage(userId, 'ai', text); // A resposta da IA é sempre salva.

    // Retorna a resposta da IA para o frontend.
    res.json({ response: text });
  } catch (error) {
    // Em caso de erro no processo, retorna uma resposta de erro 500.
    res.status(500).json({ message: "Erro ao gerar resposta da IA.", error: error.message });
  }
};

// Função exportada para obter a mensagem motivacional diária.
export const getDailyMessage = async (req, res) => {
  // Pega o ID do usuário autenticado.
  const userId = req.userId;

  try {
    // 1. Verifica no banco de dados se já existe uma mensagem para o usuário na data atual.
    const today = new Date().toISOString().slice(0, 10); // Formato YYYY-MM-DD

    const { data: existingMessage, error: existingError } = await supabase
      .from('daily_messages')
      .select('message')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lte('created_at', `${today}T23:59:59.999Z`)
      .single();

    // Se uma mensagem já existir para hoje, retorna ela diretamente.
    if (existingMessage) {
      return res.json({ message: existingMessage.message });
    }

    // 2. Se não existe, busca o nome e o objetivo do usuário para personalizar a nova mensagem.
    const { data: userData, error: userError } = await supabase
      .from('Users_data')
      .select('nome, objetivo')
      .eq('id', userId)
      .single();

    if (userError) throw new Error('Usuário não encontrado para gerar mensagem.');

    // 3. Cria um prompt para a IA gerar uma mensagem motivacional.
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Gere uma mensagem motivacional curta e inspiradora (no máximo 3 frases) para ${userData.nome || 'um usuário'} que está focado em seu objetivo de "${userData.objetivo || 'melhorar a saúde'}". A mensagem deve ser positiva e encorajadora.`;

    // Gera a nova mensagem.
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const newMessage = response.text();

    // 4. Salva a nova mensagem no banco de dados para que ela possa ser recuperada no mesmo dia.
    const { error: insertError } = await supabase
      .from('daily_messages')
      .insert({ user_id: userId, message: newMessage });

    if (insertError) {
      // Se houver falha ao salvar, apenas registra o erro no console, mas não impede que a mensagem seja enviada ao usuário.
      console.error('Falha ao salvar mensagem diária:', insertError);
    }

    // Retorna a nova mensagem gerada para o frontend.
    res.json({ message: newMessage });

  } catch (error) {
    // Em caso de erro, retorna uma resposta de erro 500.
    res.status(500).json({ message: "Erro ao gerar mensagem diária.", error: error.message });
  }
};