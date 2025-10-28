import React from 'react';
import { useNavigate } from 'react-router-dom';

// Componentes de ícone simples para representar os agentes
const DumbbellIcon = () => <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>🏋️</span>;
const AppleIcon = () => <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>🍎</span>;

export default function LandingPage() {
  const navigate = useNavigate();

  // Estilos da página
  const pageStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    // Novo fundo vermelho, mais vibrante e com um gradiente sutil
    background: 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)',
    color: 'white',
    padding: '2rem',
    textAlign: 'center',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 'clamp(2.5rem, 8vw, 4rem)', // Tamanho de fonte responsivo
    fontWeight: 'bold',
    color: '#FFD600', // Amarelo vibrante para o título
    marginBottom: '1rem',
    textShadow: '2px 2px 6px rgba(0,0,0,0.4)',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: 'clamp(1rem, 3vw, 1.25rem)',
    maxWidth: '700px',
    marginBottom: '3rem',
    lineHeight: '1.6',
    color: '#f7fafc', // Branco um pouco mais suave
  };

  const agentsSectionStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '900px',
    marginBottom: '3rem',
  };

  const agentsTitleStyle: React.CSSProperties = {
    fontSize: 'clamp(1.5rem, 5vw, 2.25rem)',
    fontWeight: 600,
    marginBottom: '2rem',
    color: '#FFD600', // Amarelo vibrante
  };

  const agentsContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '2rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  };

  const agentCardStyle: React.CSSProperties = {
    background: 'rgba(0, 0, 0, 0.25)', // Fundo escuro e semitransparente para destacar
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '2rem',
    width: '300px',
    maxWidth: '90%',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  };

  const ctaButtonStyle: React.CSSProperties = {
    backgroundColor: '#FFD600', // Amarelo vibrante
    color: '#B71C1C', // Vermelho escuro para o texto do botão
    border: 'none',
    borderRadius: '50px',
    padding: '1rem 2.5rem',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: '0 4px 14px 0 rgba(0,0,0,0.2)',
    transition: 'transform 0.2s ease, background-color 0.2s ease',
  };

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>FitCoachAI</h1>
      <p style={descriptionStyle}>
        Sua jornada para uma vida mais saudável começa aqui. Com a ajuda da nossa inteligência artificial, criamos planos de treino e dieta totalmente personalizados para você alcançar seus objetivos de forma inteligente e eficaz.
      </p>

      <div style={agentsSectionStyle}>
        <h2 style={agentsTitleStyle}>Nossos Especialistas Virtuais</h2>
        <div style={agentsContainerStyle}>
          {/* Card Personal Trainer */}
          <div style={agentCardStyle}>
            <DumbbellIcon />
            <h3 style={{ marginTop: '1rem', color: '#FFD600' }}>Personal Trainer AI</h3>
            <p style={{ color: '#edf2f7' }}>Cria rotinas de exercícios sob medida, ajustadas ao seu nível, experiência e metas, seja para ganhar massa, emagrecer ou simplesmente se manter ativo.</p>
          </div>

          {/* Card Nutricionista */}
          <div style={agentCardStyle}>
            <AppleIcon />
            <h3 style={{ marginTop: '1rem', color: '#FFD600' }}>Nutricionista AI</h3>
            <p style={{ color: '#edf2f7' }}>Desenvolve planos alimentares balanceados, considerando suas alergias, preferências e o número de refeições ideal para o seu dia a dia.</p>
          </div>
        </div>
      </div>

      <button
        style={ctaButtonStyle}
        onClick={() => navigate('/login')}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        Começar Agora
      </button>
    </div>
  );
}