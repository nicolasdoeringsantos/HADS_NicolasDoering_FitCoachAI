import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Exercicios from "./components/Exercicios";
import ExercicioDetalhe from "./pages/ExercicioDetalhe";
import MensagemMotivacional from "./pages/MensagemMotivacional";
import Chat from "./pages/Chat"; // 1. Importe o componente de Chat
import "./App.css";

function App() {
  // 2. Defina o contexto que a IA usará
  const chatContext = "Você é um personal trainer e nutricionista chamado FitCoachAI. Responda em português do Brasil. Seja amigável, motivador e forneça conselhos seguros e baseados em evidências. Use os dados do usuário para personalizar suas recomendações. Sempre que criar um plano de treino, formate-o usando markdown com títulos, listas e negrito para facilitar a leitura.";

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/app" element={<Exercicios />} />
        <Route path="/exercicio/:id" element={<ExercicioDetalhe />} />
        <Route path="/motivacional" element={<MensagemMotivacional />} />
        {/* 3. Adicione a nova rota para o chat */}
        <Route path="/chat" element={<Chat context={chatContext} />} />
      </Routes>
    </div>
  );
}

export default App;
