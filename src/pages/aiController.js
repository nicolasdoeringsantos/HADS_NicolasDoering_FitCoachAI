import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../supabaseClient.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateChatResponse = async (req, res) => {
  const { prompt, context } = req.body;
  const userId = req.userId; // ID do usuário vindo do middleware 'protect'

  if (!prompt) {
    return res.status(400).json({ message: "O prompt é obrigatório." });
  }

  try {
    // 1. Buscar os dados do usuário no banco de dados
    const { data: userData, error: userError } = await supabase
      .from('Users_data')
      .select('username, nome, idade, sexo, altura, peso, nivel, experiencia, objetivo, restricao')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error('Erro ao buscar dados do usuário.');
    }

    // 2. Construir um prompt mais detalhado com os dados do usuário
    const userProfileContext = `
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
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const fullPrompt = `${context}\n\n${userProfileContext}\n\nUsuário: ${prompt}\n\nFitCoachAI:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    res.json({ response: text });
  } catch (error) {
    res.status(500).json({ message: "Erro ao gerar resposta da IA.", error: error.message, details: error.stack });
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