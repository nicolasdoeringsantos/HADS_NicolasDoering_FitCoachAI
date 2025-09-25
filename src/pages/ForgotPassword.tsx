import { useState } from "react";
import InputField from "../components/InputField";

interface ForgotPasswordProps {
  setPage: (page: string) => void;
}

type RecoveryMethod = "main_email" | "alt_email" | "phone";

export default function ForgotPassword({ setPage }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [altEmail, setAltEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>("main_email");

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Recuperação de senha para: ${email}\nEmail alternativo: ${altEmail}\nTelefone: ${phone}`); // Lógica de recuperação aqui
  };

  return (
    <div className="card">
      <h2>Recuperar Senha</h2>
      <form onSubmit={handleForgot}>
        <InputField
          label="Email principal"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {recoveryMethod === "main_email" && (
          <button type="button" className="link-btn" onClick={() => setRecoveryMethod("alt_email")}>
            Usar email alternativo
          </button>
        )}
        {recoveryMethod === "alt_email" && (
          <InputField
            label="Email alternativo (opcional)"
            type="email"
            value={altEmail}
            onChange={(e) => setAltEmail(e.target.value)}
          />
        )}
        {recoveryMethod !== "phone" && (
          <button type="button" className="link-btn" onClick={() => setRecoveryMethod("phone")}>
            Usar número cadastrado
          </button>
        )}
        {recoveryMethod === "phone" && (
          <InputField
            label="Número cadastrado (opcional)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        )}
        <button type="submit" className="btn btn-primary">Enviar</button>
      </form>
      <button onClick={() => setPage("login")} className="link-btn">Voltar ao login</button>
    </div>
  );
}
