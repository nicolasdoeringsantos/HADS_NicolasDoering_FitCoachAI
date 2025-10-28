import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import { supabase } from "./supabaseClient";

export default function Register() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmaSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: senha,
      });

      if (error) {
        alert(error.message || "Erro ao cadastrar usuário.");
      } else {
        alert("Cadastro realizado! Verifique seu e-mail para confirmar sua conta antes de fazer o login.");
        navigate("/");
      }
    } catch (err) {
      alert("Erro ao conectar ao servidor.");
    }
  };

  return (
    <div className="card">
      <h2>Cadastro</h2>
      <form onSubmit={handleRegister}>
        <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <InputField label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <InputField label="Confirme sua senha" type="password" value={confirmaSenha} onChange={(e) => setConfirmaSenha(e.target.value)} />
        <button type="submit" className="btn btn-primary">Cadastrar</button>
      </form>
      <button onClick={() => navigate("/login")} className="link-btn">Já tem conta? Entrar</button>
    </div>
  );
}
