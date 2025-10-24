import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function MensagemMotivacional() {
  const [message, setMessage] = useState("Carregando sua inspiração do dia...");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessage = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        navigate("/"); // Redireciona para o login se não houver token
        return;
      }

      // Contexto específico para a mensagem motivacional
      const motivationalContext = `
        Você é o FitCoachAI, um assistente de fitness e saúde.
        Seu objetivo é ser um coach motivacional.
        Gere uma mensagem motivacional curta e inspiradora (no máximo 3 frases) para o usuário.
      `.trim();

      try {
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({ type: 'daily_message', context: motivationalContext }),
        });

        const data = await res.json();

        if (res.ok) {
          setMessage(data.response); // A Edge Function retornará 'response'
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f0f4f8", padding: '1rem' }}>
      <div style={{ background: "#fff", borderRadius: '1.5rem', boxShadow: "0 8px 30px rgba(0,0,0,0.12)", padding: '2rem', width: "100%", maxWidth: 480, textAlign: "center" }}>
        <h2 style={{ color: '#16a34a', fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          <span role="img" aria-label="sparkles" style={{ marginRight: '0.5rem' }}>✨</span>
          Sua Mensagem do Dia
        </h2>
        <p style={{ 
          color: error ? "#d00" : "#374151", 
          fontSize: '1.25rem', 
          lineHeight: '1.6',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {error || `“${message}”`}
        </p>
      </div>
      <button onClick={() => navigate(-1)} style={{ marginTop: 24, background: "#23272f", color: "#fff", border: 0, borderRadius: 8, padding: "10px 32px", cursor: "pointer", textDecoration: "none", fontSize: '1rem', fontWeight: 600 }}>
        Voltar
      </button>
    </div>
  );
}
