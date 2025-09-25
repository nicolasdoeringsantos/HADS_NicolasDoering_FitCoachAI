

import { useState } from "react";

// Simulação de dados de exercícios
const mockExercicios = [
  {
    id: 1,
    titulo: "Exercício",
    descricao: "Exemplo de exercício.",
    imagem: "exerc.png"
  }
];
// Componente principal Exercicios
export default function Exercicios() {
  // Estados globais do componente
  const [perfilPage, setPerfilPage] = useState(false);
  const [configPage, setConfigPage] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgPage, setImgPage] = useState<number|null>(null);
  const [loading, setLoading] = useState(false);

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

  // Estados do formulário de senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erroTreino, setErroTreino] = useState("");
  const [sucessoTreino, setSucessoTreino] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [sucessoSenha, setSucessoSenha] = useState("");
  const [senhaOpen, setSenhaOpen] = useState(true);

  // Funções de submit
  const handleSubmitTreino = (e: React.FormEvent) => {
    e.preventDefault();
    setErroTreino("");
    setSucessoTreino("");
    if (!nome || !idade || !sexo || !altura || !peso || !nivel || !experiencia) {
      setErroTreino("Preencha todos os campos obrigatórios.");
      return;
    }
    setSucessoTreino("Dados salvos! Pronto para criar seu treino.");
  };

  const handleSubmitSenha = (e: React.FormEvent) => {
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
    setSucessoSenha("Senha alterada com sucesso!");
  };
  // (removida chave solta)

  if (perfilPage) {
    return (
      <div style={{ minHeight: "100vh", width: "100vw", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f2f4f8" }}>
        <button style={{ marginBottom: 18, background: "#23272f", color: "#fff", border: 0, borderRadius: 6, padding: "6px 18px", cursor: "pointer" }} onClick={() => setPerfilPage(false)}>
          Voltar
        </button>
        {/* Card de dados do treino */}
        <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 2px 8px #bbb", padding: 24, minWidth: 320, maxWidth: 400, width: "100%", marginBottom: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", userSelect: "none" }}>
            <img src="https://www.w3schools.com/howto/img_avatar.png" alt="Perfil" style={{ width: 90, height: 90, objectFit: "cover", borderRadius: "50%", border: "2px solid #23272f", marginBottom: 8 }} />
            <div style={{ fontSize: 20, color: "#23272f", fontWeight: 600, marginBottom: 2 }}>Dados para criar seu treino</div>
          </div>
          <form onSubmit={handleSubmitTreino} style={{ display: 'flex', flexDirection: "column", gap: 14, marginTop: 16 }}>
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
    return (
      <div style={{ minHeight: "100vh", width: "100vw", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f2f4f8" }}>
        <button style={{ marginBottom: 18, background: "#23272f", color: "#fff", border: 0, borderRadius: 6, padding: "6px 18px", cursor: "pointer" }} onClick={() => setConfigPage(false)}>
          Voltar
        </button>
        <div style={{ fontSize: 22, color: "#23272f", fontWeight: 600, marginBottom: 18 }}>Configurações</div>
        <div style={{ fontSize: 15, color: "#444" }}>Aqui você pode mostrar as configurações do app.</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "#f2f4f8", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start" }}>
      {/* Menu Hambúrguer */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: 60,
          background: "#23272f",
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
        <span style={{ fontWeight: 500, fontSize: 20 }}>Bem-vindo, Usuário</span>
        <div style={{ width: 32 }} />
      </header>
      {menuOpen && (
        <div style={{
          position: "fixed",
          top: 60,
          left: 0,
          width: "100vw",
          background: "#23272f",
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
              setMenuOpen(false);
              // ação de logout simulada
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
      {/* Mensagem de erro removida pois não está em uso */}
      {/* Mensagem de sucesso removida pois não está em uso */}

      {/* Cards de exercícios simulados */}
      <div style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 24,
        marginTop: 100,
        width: "100%",
        flexWrap: "wrap",
        animation: "fadeIn 0.5s"
      }}>
        {mockExercicios.map(exercicio => (
          <div
            key={exercicio.id}
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                setImgPage(exercicio.id);
              }, 400); // Simula carregamento
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              background: "#fff",
              borderRadius: 32,
              boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
              padding: 32,
              width: 180,
              minWidth: 120,
              maxWidth: 220,
              transition: "transform 0.15s, box-shadow 0.15s",
              marginBottom: 12
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <img
              src={exercicio.imagem}
              alt={exercicio.titulo}
              style={{ width: 80, height: 80, objectFit: "contain", marginBottom: 18, display: "block", borderRadius: 24, border: "2px solid #eee", background: "#f8f8f8" }}
            />
            <div style={{ fontWeight: 600, fontSize: 20, color: "#23272f", textAlign: "center" }}>
              {exercicio.titulo}
            </div>
            <div style={{ fontSize: 14, color: "#666", marginTop: 6, textAlign: "center" }}>{exercicio.descricao}</div>
          </div>
        ))}
        {/* Card de perfil */}
        <div
          onClick={() => setPerfilPage(true)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            padding: 32,
            width: 180,
            minWidth: 120,
            maxWidth: 220,
            cursor: "pointer",
            transition: "transform 0.15s, box-shadow 0.15s"
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          <img
            src="https://www.w3schools.com/howto/img_avatar.png"
            alt="Perfil"
            style={{ width: 80, height: 80, objectFit: "cover", marginBottom: 18, display: "block", borderRadius: "50%", border: "2px solid #eee" }}
          />
          <div style={{ fontWeight: 600, fontSize: 20, color: "#23272f", textAlign: "center" }}>
            Perfil
          </div>
          <div style={{ fontSize: 14, color: "#666", marginTop: 6, textAlign: "center" }}>Ver informações do usuário</div>
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
