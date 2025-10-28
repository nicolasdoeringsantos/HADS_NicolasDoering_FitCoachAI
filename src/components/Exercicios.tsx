

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../pages/supabaseClient";

// Simulação de dados de exercícios
const mockExercicios = [
  {
    id: 1,
    titulo: "Exercício",
    descricao: "Exemplo de exercício",
    imagem: "exerc.png"
  }
];
// Componente principal Exercicios
export default function Exercicios() {
  // Estado para horário de mensagem motivacional
  const [horarioMotivacional, setHorarioMotivacional] = useState("08:00");
  const [sucessoHorario, setSucessoHorario] = useState("");
  const navigate = useNavigate();
  // Estados globais do componente
  const [perfilPage, setPerfilPage] = useState(false);
  const [configPage, setConfigPage] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Estados do formulário de perfil
  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [idade, setIdade] = useState("");
  const [sexo, setSexo] = useState("");
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [nivel, setNivel] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [restricao, setRestricao] = useState("");
  // Estados do formulário de dieta
  const [alergias, setAlergias] = useState("");
  const [intolerancias, setIntolerancias] = useState("");
  const [comidasNaoGosta, setComidasNaoGosta] = useState("");
  const [tipoDieta, setTipoDieta] = useState("");
  const [refeicoesPorDia, setRefeicoesPorDia] = useState("");

  // Estados do formulário de senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erroTreino, setErroTreino] = useState("");
  const [sucessoTreino, setSucessoTreino] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [sucessoSenha, setSucessoSenha] = useState("");
  const [erroDieta, setErroDieta] = useState("");
  const [sucessoDieta, setSucessoDieta] = useState("");

  // Funções de submit
  const handleSubmitPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroTreino("");
    setSucessoTreino("");
    if (!nome || !idade || !sexo || !altura || !peso) {
      setErroTreino("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado");

      const { error } = await supabase
        .from('Users_data')
        .upsert({
          id: user.id, // Garante que o ID do usuário seja inserido ou usado para a correspondência
          nome,
          apelido,
          idade: parseInt(idade) || null,
          sexo,
          altura: parseInt(altura) || null,
          peso: parseFloat(peso) || null,
          nivel,
          experiencia,
          objetivo,
          restricao,
          alergias,
          intolerancias,
          comidas_que_nao_gosta: comidasNaoGosta,
          tipo_dieta_preferida: tipoDieta,
          refeicoes_por_dia: parseInt(refeicoesPorDia) || null,
        });

      if (error) {
        throw error;
      }

      setSucessoTreino("Dados salvos! Pronto para criar seu treino.");
      setSucessoDieta("Dados de dieta salvos com sucesso!");
    } catch (error: any) {
      setErroTreino(error.message || "Erro ao salvar os dados.");
      setErroDieta(error.message || "Erro ao salvar os dados da dieta.");
    }
  };

  // Carregar dados do usuário ao abrir a página de perfil
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado.");

        const { data, error } = await supabase
          .from('Users_data')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignora erro se o perfil ainda não existe

        if (data) {
          setNome(data.nome || "");
          setApelido(data.apelido || "");
          setIdade(data.idade?.toString() || "");
          setSexo(data.sexo || "");
          setAltura(data.altura?.toString() || "");
          setPeso(data.peso?.toString() || "");
          setNivel(data.nivel || "");
          setExperiencia(data.experiencia || "");
          setObjetivo(data.objetivo || "");
          setRestricao(data.restricao || "");
          setAlergias(data.alergias || "");
          setIntolerancias(data.intolerancias || "");
          setComidasNaoGosta(data.comidas_que_nao_gosta || "");
          setTipoDieta(data.tipo_dieta_preferida || "");
          setRefeicoesPorDia(data.refeicoes_por_dia?.toString() || "");
        }
      } catch (error: any) {
        setErroTreino("Erro ao carregar dados do perfil: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    if (perfilPage) fetchUserData();
  }, [perfilPage]);

  // Efeito para carregar e aplicar o modo noturno
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedMode);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', String(isDarkMode));
    if (isDarkMode) {
      document.body.style.backgroundColor = '#1a1a1a';
    } else {
      document.body.style.backgroundColor = '#f2f4f8';
    }
  }, [isDarkMode]);

  const handleSubmitSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroSenha("");
    setSucessoSenha("");
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErroSenha("Preencha todos os campos de senha.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErroSenha("A nova senha e a confirmação não coincidem.");
      return;
    }
    if (novaSenha.length < 6) {
      setErroSenha("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    // TODO: Adicionar validação da senha atual se necessário, o que exigiria um backend seguro.
    // A API do Supabase auth.updateUser não verifica a senha antiga por segurança.
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) {
        throw error;
      }
      setSucessoSenha("Senha alterada com sucesso!");
      // Limpar campos após o sucesso
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error: any) {
      setErroSenha(error.message || "Erro ao alterar a senha.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const colors = {
    bg: isDarkMode ? '#1a1a1a' : '#f2f4f8',
    cardBg: isDarkMode ? '#2c2c2c' : '#fff',
    text: isDarkMode ? '#e5e5e5' : '#23272f',
    subtext: isDarkMode ? '#a0a0a0' : '#666',
    border: isDarkMode ? '#444' : '#ccc',
    inputBg: isDarkMode ? '#333' : '#fff',
    inputText: isDarkMode ? '#fff' : '#000',
    headerBg: '#23272f', // Mantém o header escuro em ambos os modos
    headerText: '#fff',
    primary: '#22c55e',
  };

  if (perfilPage) {
    return ( // O código da página de perfil permanece o mesmo, mas é bom notar que o fundo aqui também mudará.
      <div style={{ minHeight: "100vh", width: "100vw", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: colors.bg, color: colors.text }}>
        <button 
          style={{ marginBottom: 18, background: "#23272f", color: "#fff", border: 0, borderRadius: 6, padding: "6px 18px", cursor: "pointer" }} 
          onClick={() => setPerfilPage(false)}
        >
          Voltar
        </button>
        {/* Card de dados do treino */}
        <div style={{ background: colors.cardBg, borderRadius: 18, boxShadow: "0 2px 8px #bbb", padding: 24, minWidth: 320, maxWidth: 400, width: "100%", marginBottom: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", userSelect: "none" }}>
            <img src="https://www.w3schools.com/howto/img_avatar.png" alt="Perfil" style={{ width: 90, height: 90, objectFit: "cover", borderRadius: "50%", border: "2px solid #23272f", marginBottom: 8 }} />
            <div style={{ fontSize: 20, color: "#23272f", fontWeight: 600, marginBottom: 2 }}>Dados para criar seu treino</div>
          </div>
          <form onSubmit={handleSubmitPerfil} style={{ display: 'flex', flexDirection: "column", gap: 14, marginTop: 16 }}>
            <input type="text" placeholder="Nome completo" value={nome} onChange={e => setNome(e.target.value)} required style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
            <input type="text" placeholder="Apelido (opcional)" value={apelido} onChange={e => setApelido(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
            <input type="number" placeholder="Idade" value={idade} onChange={e => setIdade(e.target.value)} required style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
            <select value={sexo} onChange={e => setSexo(e.target.value)} required style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}>
              <option value="">Sexo</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
            </select>
            <input type="number" placeholder="Altura (cm)" value={altura} onChange={e => setAltura(e.target.value)} required style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
            <input type="number" placeholder="Peso (kg)" value={peso} onChange={e => setPeso(e.target.value)} required style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
            <select value={nivel} onChange={e => setNivel(e.target.value)} required style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}>
              <option value="">Nível de atividade</option>
              <option value="sedentario">Sedentário</option>
              <option value="leve">Leve (1-2x/semana)</option>
              <option value="moderado">Moderado (3-4x/semana)</option>
              <option value="intenso">Intenso (5x ou mais/semana)</option>
            </select>
            <select value={experiencia} onChange={e => setExperiencia(e.target.value)} required style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}>
              <option value="">Já tem experiência com treino?</option>
              <option value="nao">Não</option>
              <option value="pouca">Pouca</option>
              <option value="sim">Sim</option>
            </select>
            <input type="text" placeholder="Objetivo (ex: emagrecer, ganhar massa...)" value={objetivo} onChange={e => setObjetivo(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
            <input type="text" placeholder="Restrições de saúde (opcional)" value={restricao} onChange={e => setRestricao(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
            <div style={{ fontWeight: 500, color: '#23272f', marginBottom: 2, marginTop: 8 }}>Preferências (opcional)</div>
            <textarea placeholder="Observações, preferências de treino, horários, etc." style={{ padding: 8, borderRadius: 8, border: '1px solid #ccc', minHeight: 40 }} />
            
            {/* Seção de Dieta */}
            <div style={{ fontSize: 20, color: "#23272f", fontWeight: 600, marginTop: 24, marginBottom: 8, textAlign: 'center' }}>Dados para criar sua dieta</div>
            <input type="text" placeholder="Alergias alimentares (ex: amendoim, frutos do mar)" value={alergias} onChange={e => setAlergias(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
            <input type="text" placeholder="Intolerâncias (ex: lactose, glúten)" value={intolerancias} onChange={e => setIntolerancias(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
            <input type="text" placeholder="Comidas que não gosta" value={comidasNaoGosta} onChange={e => setComidasNaoGosta(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
            <input type="text" placeholder="Tipo de dieta preferida (ex: vegetariana)" value={tipoDieta} onChange={e => setTipoDieta(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
            <select value={refeicoesPorDia} onChange={e => setRefeicoesPorDia(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}>
              <option value="">Nº de refeições por dia</option>
              <option value="3">3 refeições</option>
              <option value="4">4 refeições</option>
              <option value="5">5 refeições</option>
              <option value="6">6 ou mais refeições</option>
            </select>

            {erroTreino && <div style={{ color: "#d00", fontSize: 14, marginTop: 4 }}>{erroTreino}</div>}
            {sucessoTreino && <div style={{ color: "#080", fontSize: 14, marginTop: 4 }}>{sucessoTreino}</div>}
            <button type="submit" style={{ background: "#23272f", color: "#fff", border: 0, borderRadius: 8, padding: "10px 0", fontWeight: 600, fontSize: 16, marginTop: 8, cursor: "pointer" }}>Salvar</button>
          </form>
        </div>
        {/* Card de alterar senha */}
        <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 2px 8px #bbb", padding: 24, minWidth: 320, maxWidth: 400, width: "100%", marginTop: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", userSelect: "none" }}>
            <div style={{ fontSize: 20, color: "#23272f", fontWeight: 600, marginBottom: 2 }}>Alterar senha</div>
          </div>
          <form onSubmit={handleSubmitSenha} style={{ display: 'flex', flexDirection: "column", gap: 14, marginTop: 16 }}>
            <input type="password" placeholder="Senha atual" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
            <input type="password" placeholder="Nova senha" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
            <input type="password" placeholder="Confirmar nova senha" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
            {erroSenha && <div style={{ color: "#d00", fontSize: 14, marginTop: 4 }}>{erroSenha}</div>}
            {sucessoSenha && <div style={{ color: "#080", fontSize: 14, marginTop: 4 }}>{sucessoSenha}</div>}
            <button type="submit" style={{ background: "#23272f", color: "#fff", border: 0, borderRadius: 8, padding: "10px 0", fontWeight: 600, fontSize: 16, marginTop: 8, cursor: "pointer" }}>Salvar senha</button>
          </form>
        </div>
      </div>
    );
  }

  if (configPage) {
    const handleHorarioSubmit = (e: React.FormEvent) => { // O código da página de configurações também permanece o mesmo.
      e.preventDefault();
      setSucessoHorario("Horário salvo com sucesso!");
      setTimeout(() => setSucessoHorario(""), 2000);
    };
    return (
      <div style={{ minHeight: "100vh", width: "100vw", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: colors.bg, color: colors.text }}>
        <div style={{ fontSize: 22, color: colors.text, fontWeight: 600, marginBottom: 18 }}>Configurações</div>
        <form onSubmit={handleHorarioSubmit} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #bbb", padding: 24, minWidth: 280, maxWidth: 340, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <label style={{ fontWeight: 500, color: "#23272f", fontSize: 16, marginBottom: 6 }}>
            Horário para receber mensagem motivacional:
            <input
              type="time"
              value={horarioMotivacional}
              onChange={e => setHorarioMotivacional(e.target.value)}
              style={{ marginLeft: 10, padding: 6, borderRadius: 6, border: "1px solid #ccc", fontSize: 15 }}
              required
            />
          </label>
          <button type="submit" style={{ background: "#23272f", color: "#fff", border: 0, borderRadius: 8, padding: "8px 24px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Salvar horário</button>
          {sucessoHorario && <div style={{ color: "#080", fontSize: 14, marginTop: 4 }}>{sucessoHorario}</div>}
        </form>
        {/* Configuração de Modo Noturno */}
        <form style={{ background: colors.cardBg, borderRadius: 16, boxShadow: "0 2px 8px #bbb", padding: 24, minWidth: 280, maxWidth: 340, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginTop: 24 }}>
          <label style={{ fontWeight: 500, color: colors.text, fontSize: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            Modo Noturno
            <label style={{ display: 'inline-flex', position: 'relative', cursor: 'pointer' }}>
              <input type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ width: 42, height: 22, borderRadius: 11, background: isDarkMode ? colors.primary : '#ccc', display: 'block', position: 'relative', transition: 'background 0.2s' }}><span style={{ content: '""', position: 'absolute', top: 2, left: 2, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'transform 0.2s', transform: isDarkMode ? 'translateX(20px)' : 'translateX(0)' }}></span></span>
            </label>
          </label>
        </form>
        <button
          style={{ marginTop: 32, background: "#23272f", color: "#fff", border: 0, borderRadius: 8, padding: "10px 32px", fontWeight: 600, fontSize: 16, cursor: "pointer" }}
          onClick={() => setConfigPage(false)}
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      width: "100vw", 
      background: '#4c1d1d', // Fundo vermelho escuro e opaco
      color: '#fff',
      position: "relative", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "flex-start" }}>
      {/* Menu Hambúrguer */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: 60,
          background: "rgba(0,0,0,0.2)", // Header semitransparente
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 100,
          padding: "0 24px",
          boxSizing: "border-box",
          boxShadow: "0 2px 8px rgba(0,0,0,0.10)"
        }}
      >
        <button style={{ background: 'transparent', border: 0, color: '#fff', fontSize: 28, cursor: 'pointer', padding: 0, marginRight: 8 }} onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
          ☰
        </button>
        <span style={{ fontWeight: 600, fontSize: 20, color: '#FFD600' }}>FitCoachAI</span>
        <div style={{ width: 32 }} />
      </header>
      {menuOpen && (
        <div style={{
          position: "fixed",
          top: 60,
          left: 0,
          width: "100vw",
          background: "rgba(0,0,0,0.4)",
          color: "#fff",
          zIndex: 200,
          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
          padding: "16px 0 8px 0",
          animation: "fadeInDown 0.3s"
        }}>
          <div
            style={{ padding: "12px 32px", cursor: "pointer", fontSize: 18 }}
            onClick={() => {
              setPerfilPage(true);
              setMenuOpen(false);
            }}
          >
            Usuário
          </div>
          <div
            style={{ padding: "12px 32px", cursor: "pointer", fontSize: 18 }}
            onClick={() => {
              setConfigPage(true);
              setMenuOpen(false);
            }}
          >
            Configurações
          </div>
          <div
            style={{ padding: "12px 32px", cursor: "pointer", color: "#d00", fontSize: 18 }}
            onClick={() => {
              handleLogout();
            }}
          >
            Sair
          </div>
        </div>
      )}

      {/* Feedback visual */}
      {loading && (
        <div style={{ position: "fixed", top: 70, left: 0, width: "100vw", textAlign: "center", zIndex: 300 }}>
          <span style={{ background: "#fff", color: "#23272f", padding: "8px 24px", borderRadius: 8, boxShadow: "0 2px 8px #bbb", fontWeight: 500 }}>Carregando...</span>
        </div>
      )}
      {/* Cards de exercícios simulados + perfil + mensagem motivacional */}
      <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          minHeight: 'calc(100vh - 60px)',
          marginTop: '60px',
          padding: '2rem',
          gap: '4rem',
          flexWrap: 'wrap',
          boxSizing: 'border-box'
      }}>
        {/* Seção de Descrição */}
        <div style={{ maxWidth: '450px', textAlign: 'left', animation: "fadeIn 0.8s" }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', color: '#FFD600', textShadow: '1px 1px 4px rgba(0,0,0,0.5)', margin: '0 0 1rem 0' }}>Sua Jornada Começa Agora</h1>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#f0f0f0' }}>
            Bem-vindo ao seu painel de controle. Aqui você tem acesso direto aos nossos especialistas de IA para criar seus treinos e dietas. Use as ferramentas ao lado para começar.
          </p>
        </div>

        {/* Seção de Ferramentas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: "fadeIn 0.8s 0.2s backwards" }}>
            {/* Card de Treino */}
            <div
              onClick={() => navigate(`/chat`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', cursor: 'pointer',
                transition: 'transform 0.2s ease, background 0.2s ease', minWidth: '350px'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.background = "rgba(0,0,0,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "rgba(0,0,0,0.2)"; }}
            >
              <span style={{ fontSize: '2.5rem' }}>🏋️</span>
              <div>
                <h3 style={{ margin: 0, color: '#FFD600' }}>Personal Trainer AI</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#ddd' }}>Crie e ajuste seus treinos.</p>
              </div>
            </div>

            {/* Card de Nutrição */}
            <div
              onClick={() => navigate(`/chat-alimentacao`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', cursor: 'pointer',
                transition: 'transform 0.2s ease, background 0.2s ease', minWidth: '350px'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.background = "rgba(0,0,0,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "rgba(0,0,0,0.2)"; }}
            >
              <span style={{ fontSize: '2.5rem' }}>🍎</span>
              <div>
                <h3 style={{ margin: 0, color: '#FFD600' }}>Nutricionista AI</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#ddd' }}>Receba dietas e dicas de nutrição.</p>
              </div>
            </div>

            {/* Card de Perfil */}
            <div
              onClick={() => setPerfilPage(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', cursor: 'pointer',
                transition: 'transform 0.2s ease, background 0.2s ease', minWidth: '350px'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.background = "rgba(0,0,0,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "rgba(0,0,0,0.2)"; }}
            >
              <span style={{ fontSize: '2.5rem' }}>👤</span>
              <div>
                <h3 style={{ margin: 0, color: '#FFD600' }}>Meu Perfil</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#ddd' }}>Ajuste seus dados e preferências.</p>
              </div>
            </div>
        </div>
      </div>
      {/* Animações CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
