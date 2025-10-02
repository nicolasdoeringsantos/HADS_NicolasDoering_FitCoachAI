import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  // Login integrado com backend
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      alert("Preencha email e senha.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: senha })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        navigate("/app");
      } else {
        alert(data.message || "Erro ao fazer login.");
      }
    } catch (err) {
      alert("Erro ao conectar ao servidor.");
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

      <button onClick={() => navigate("/forgot")} className="link-btn">Esqueceu a senha?</button>
      <button onClick={() => navigate("/register")} className="link-btn">Criar conta</button>
    </div>
  );
}
