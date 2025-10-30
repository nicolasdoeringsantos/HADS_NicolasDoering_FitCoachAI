import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import { supabase } from "./supabaseClient";


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleForgot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        alert(error.message);
      } else {
        alert("Verifique seu e-mail para o link de recuperação de senha!");
        navigate("/");
      }
    } catch (error: any) {
      alert(error.message || "Erro ao enviar e-mail de recuperação.");
    }
  };

  return (
    <div className="card">
      <h2>Recuperar Senha</h2>
      <form onSubmit={handleForgot}>
        <InputField
          label="Email principal"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Enviar</button>
      </form>
      <button onClick={() => navigate("/login")} className="link-btn">Voltar ao login</button>
    </div>
  );
}