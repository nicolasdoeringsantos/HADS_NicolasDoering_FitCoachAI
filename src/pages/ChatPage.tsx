// Importa o componente de chat principal, que contém a lógica da interface de chat.
import  ChatComponent from './ChatComponent';

// Define o componente de página de chat de treino.
export default function ChatPage() {
  // Retorna o ChatComponent configurado especificamente para o chat de treino.
  return (
    <ChatComponent 
      chatType="treino" // Define o tipo de chat, usado para salvar o histórico.
      placeholder='Peça seu plano de treino...' // Texto que aparece no campo de digitação.
      title='Treino AI' // Título exibido no cabeçalho do chat.
      initialMessage='Bem-vindo! Sou seu Treino AI, especialista em treinos personalizados. O que você gostaria de fazer hoje?' // Mensagem inicial da IA.
      // Contexto enviado para a IA para que ela saiba seu papel.
      context="Você é um personal trainer especialista em IA. Sua tarefa é criar planos de treino personalizados."
    />
  );
}