import  ChatComponent from './ChatComponent';

export default function ChatPage() {
  return (
    <ChatComponent chatType="treino" placeholder='test' title='Treino AI' initialMessage='Bem-vindo! Sou seu Treino AI, especialista em treinos personalizados. O que você gostaria de fazer hoje?' context="text"/>
  );
}