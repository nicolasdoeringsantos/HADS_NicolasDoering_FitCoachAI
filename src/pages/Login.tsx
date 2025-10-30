import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Supondo que você tenha um cliente supabase no frontend
import { supabase } from "./supabaseClient";
import InputField from "../components/InputField";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Usando o cliente Supabase diretamente para o login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      });

      if (error) {
        alert(error.message || "Erro ao fazer login.");
      } else if (data.user && data.user.email_confirmed_at === null) {
        // Se o usuário existe mas o e-mail não foi confirmado
        await supabase.auth.signOut(); // Desloga o usuário
        alert("Você precisa confirmar seu e-mail antes de fazer o login. Verifique sua caixa de entrada.");
      } else {
        // O cliente Supabase gerencia a sessão automaticamente no localStorage.
        // Login bem-sucedido e e-mail confirmado
        navigate("/app"); // Navega para a página principal da aplicação
      }
    } catch (err) {
      alert("Erro ao conectar ao servidor.");
    }
  };

  return (
    <div className="card">
      <h2>Entrar</h2>
      <form onSubmit={handleLogin}>
        <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        <InputField label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <button type="submit" className="btn btn-primary">Entrar</button>
      </form>
      {/* Container para limpar o float dos botões abaixo */}
      <div style={{ width: '100%', marginTop: '1rem', overflow: 'hidden' }}>
        <button onClick={() => navigate("/register")} className="link-btn" style={{ float: 'left' }}>
          Não tem conta? Cadastre-se
        </button>
        <button onClick={() => navigate("/forgot")} className="link-btn" style={{ float: 'right', position: 'relative', top: '-8px' }}>
          Esqueceu sua senha?
        </button>
      </div>
    </div>
  );
}