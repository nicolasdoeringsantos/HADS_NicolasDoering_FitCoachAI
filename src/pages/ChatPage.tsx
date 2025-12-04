import  ChatComponent from './ChatComponent';

export default function ChatPage() {
  return (
    <ChatComponent chatType="treino" placeholder='Peça seu plano de treino...' title='Treino AI' initialMessage='Bem-vindo! Sou seu Treino AI, especialista em treinos personalizados. O que você gostaria de fazer hoje?' context="text"/>
  );
}