import { useState } from "react";
import InputField from "../components/InputField";

interface LoginProps {
  setPage: (page: string) => void;
}


export default function Login({ setPage }: LoginProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Simula login localmente, sem backend
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && senha) {
      setPage("app");
    } else {
      alert("Preencha email e senha.");
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <InputField label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />

        <button type="submit" className="btn btn-primary">Entrar</button>
      </form>

      <button onClick={() => setPage("forgot")} className="link-btn">Esqueceu a senha?</button>
      <button onClick={() => setPage("register")} className="link-btn">Criar conta</button>
    </div>
  );
}
