// ...existing code...
import { useParams, Link } from "react-router-dom";

export default function ExercicioDetalhe() {
  const { id } = useParams();
  // Dados temporários simulados
  const exercicio = {
    titulo: "Agachamento Livre",
    descricao: "O agachamento é um dos exercícios mais completos para membros inferiores.",
    imagem: "/exerc.png",
    dicas: [
      "Mantenha as costas retas durante o movimento.",
      "Desça até que suas coxas fiquem paralelas ao chão.",
      "Não deixe os joelhos ultrapassarem a ponta dos pés."
    ],
    beneficios: [
      "Fortalece pernas e glúteos",
      "Melhora o equilíbrio",
      "Aumenta a resistência muscular"
    ]
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f2f4f8" }}>
      <Link to="/app" style={{ marginBottom: 18, background: "#23272f", color: "#fff", border: 0, borderRadius: 6, padding: "6px 18px", cursor: "pointer", textDecoration: "none" }}>
        Voltar
      </Link>
      <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 2px 8px #bbb", padding: 24, minWidth: 320, maxWidth: 400, width: "100%", marginBottom: 24 }}>
        <h2 style={{ textAlign: "center", marginBottom: 12 }}>{exercicio.titulo}</h2>
        <img src={exercicio.imagem} alt={exercicio.titulo} style={{ width: 120, height: 120, objectFit: "contain", display: "block", margin: "0 auto 16px auto", borderRadius: 18, border: "2px solid #eee", background: "#f8f8f8" }} />
        <p style={{ color: "#444", marginBottom: 10 }}>{exercicio.descricao}</p>
        <div style={{ marginBottom: 10 }}>
          <strong>Dicas de execução:</strong>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {exercicio.dicas.map((dica, i) => (
              <li key={i} style={{ color: "#23272f", fontSize: 14 }}>{dica}</li>
            ))}
          </ul>
        </div>
        <div style={{ marginBottom: 10 }}>
          <strong>Benefícios:</strong>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {exercicio.beneficios.map((b, i) => (
              <li key={i} style={{ color: "#23272f", fontSize: 14 }}>{b}</li>
            ))}
          </ul>
        </div>
        <div style={{ marginTop: 18, padding: 12, border: "1px dashed #aaa", borderRadius: 10, background: "#f8f8f8", textAlign: "center", color: "#888" }}>
          <span>O chat com a IA aparecerá aqui em breve!</span>
        </div>
      </div>
      <div style={{ color: "#888", fontSize: 13 }}>ID do exercício: {id}</div>
    </div>
  );
}
