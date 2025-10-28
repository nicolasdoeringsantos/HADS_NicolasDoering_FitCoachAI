import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Exercicios from "./components/Exercicios";
import ExercicioDetalhe from "./pages/ExercicioDetalhe";
import MensagemMotivacional from "./pages/MensagemMotivacional";
import ChatPage from "./pages/ChatPage"; // 1. Importe o componente de ChatPage
import AlimentacaoChatPage from "./components/AlimentacaoChatPage";
import WorkoutHistory from "./pages/WorkoutHistory"; // Importe a nova página
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/app" element={<Exercicios />} />
        <Route path="/exercicio/:id" element={<ExercicioDetalhe />} />
        <Route path="/motivacional" element={<MensagemMotivacional />} />
        {/* 2. Adicione a rota para a página de chat */}
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat-alimentacao" element={<AlimentacaoChatPage />} />
        <Route path="/historico-treinos" element={<WorkoutHistory />} />
      </Routes>
    </div>
  );
}

export default App;
