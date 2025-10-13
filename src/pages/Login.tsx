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
      } else {
        // O cliente Supabase gerencia a sessão automaticamente no localStorage.
        alert("Login bem-sucedido!");
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
      <button onClick={() => navigate("/register")} className="link-btn">Não tem conta? Cadastre-se</button>
    </div>
  );
}