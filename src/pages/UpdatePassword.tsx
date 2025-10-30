import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import InputField from "../components/InputField";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Este listener é acionado quando o usuário chega na página
    // vindo do link de e-mail, que contém o token de acesso.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // O usuário está no fluxo de recuperação de senha.
        // A sessão já contém as informações necessárias.
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setError("");
    setSuccess("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Senha atualizada com sucesso! Redirecionando para o login...");
      setTimeout(() => navigate("/login"), 3000);
    }
  };

  return (
    <div className="card">
      <h2>Crie sua Nova Senha</h2>
      <form onSubmit={handleUpdatePassword}>
        <InputField label="Nova Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <InputField label="Confirme a Nova Senha" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <button type="submit" className="btn btn-primary">Atualizar Senha</button>
      </form>
    </div>
  );
}