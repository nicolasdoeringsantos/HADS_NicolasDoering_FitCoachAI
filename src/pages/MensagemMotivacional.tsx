import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function MensagemMotivacional() {
  const [message, setMessage] = useState("Carregando sua inspiração do dia...");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessage = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/"); // Redireciona para o login se não houver token
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/ai/daily-message", {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setMessage(data.message);
        } else {
          setError(data.message || "Não foi possível buscar a mensagem.");
        }
      } catch (err) {
        setError("Erro de conexão com o servidor.");
      }
    };

    fetchMessage();
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f2f4f8" }}>
      <Link to="/app" style={{ marginBottom: 18, background: "#23272f", color: "#fff", border: 0, borderRadius: 6, padding: "6px 18px", cursor: "pointer", textDecoration: "none" }}>
        Voltar
      </Link>
      <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 2px 8px #bbb", padding: 24, minWidth: 320, maxWidth: 400, width: "100%", textAlign: "center" }}>
        <h2>Sua Mensagem do Dia</h2>
        <img src="/motivacional.png" alt="Mensagem Motivacional" style={{ width: 120, height: 120, objectFit: "contain", margin: "0 auto 16px auto", borderRadius: 18, border: "2px solid #eee", background: "#f8f8f8" }} />
        <p style={{ color: "#444", marginBottom: 10, fontStyle: 'italic', fontSize: '1.1em' }}>
          {error || `"${message}"`}
        </p>
      </div>
    </div>
  );
}
