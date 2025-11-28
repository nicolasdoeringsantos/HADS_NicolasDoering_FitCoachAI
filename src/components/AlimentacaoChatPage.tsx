import Chat from '../pages/ChatComponent';

export default function AlimentacaoChatPage() {
  const dietContext = "Você é um nutricionista de IA. Forneça planos de dieta e conselhos nutricionais. Seja encorajador e informativo.";
  return (
    <Chat chatType="dieta"  
          placeholder='Peça um plano de dieta...' 
          title='Nutricionista AI' 
          initialMessage='Olá! Sou seu Nutricionista AI. Como posso ajudar você a montar sua dieta hoje?' 
          context={dietContext} />
  );
}