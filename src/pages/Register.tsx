import { useState } from "react";
import InputField from "../components/InputField";

interface RegisterProps {
  setPage: (page: string) => void;
}

export default function Register({ setPage }: RegisterProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmaSenha) {
      alert("As senhas não coincidem.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: senha })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Usuário cadastrado com sucesso! Faça login.");
        setPage("login");
      } else {
        alert(data.message || "Erro ao cadastrar usuário.");
      }
    } catch (err) {
      alert("Erro ao conectar ao servidor.");
    }
  };

  return (
    <div className="card">
      <h2>Cadastro</h2>
      <form onSubmit={handleRegister}>
        <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <InputField label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <InputField label="Confirme sua senha" type="password" value={confirmaSenha} onChange={(e) => setConfirmaSenha(e.target.value)} />
        <button type="submit" className="btn btn-primary">Cadastrar</button>
      </form>
      <button onClick={() => setPage("login")} className="link-btn">Já tem conta? Entrar</button>
    </div>
  );
}
