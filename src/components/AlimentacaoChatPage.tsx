import Chat from '../pages/ChatComponent';

export default function AlimentacaoChatPage() {
  return (
    <Chat chatType="dieta"  placeholder='test' title='Treino AI' initialMessage='Bem-vindo! Sou seu Treino AI, especialista em treinos personalizados. O que você gostaria de fazer hoje?' context="text" />
  );
}