import { Link } from "react-router-dom";

export default function MensagemMotivacional() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f2f4f8" }}>
      <Link to="/app" style={{ marginBottom: 18, background: "#23272f", color: "#fff", border: 0, borderRadius: 6, padding: "6px 18px", cursor: "pointer", textDecoration: "none" }}>
        Voltar
      </Link>
      <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 2px 8px #bbb", padding: 24, minWidth: 320, maxWidth: 400, width: "100%", textAlign: "center" }}>
        <h2>Mensagem Motivacional</h2>
        <img src="/motivacional.png" alt="Mensagem Motivacional" style={{ width: 120, height: 120, objectFit: "contain", margin: "0 auto 16px auto", borderRadius: 18, border: "2px solid #eee", background: "#f8f8f8" }} />
        <p style={{ color: "#444", marginBottom: 10 }}>
          "O sucesso é a soma de pequenos esforços repetidos dia após dia. Não desista!"
        </p>
      </div>
    </div>
  );
}
