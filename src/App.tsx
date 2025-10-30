import { Routes, Route } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import ExercicioDetalhe from "./pages/ExercicioDetalhe";
import MensagemMotivacional from "./pages/MensagemMotivacional";
import ChatPage from "./pages/ChatPage";


// Components
import Exercicios from "./components/Exercicios";
import AlimentacaoChatPage from "./components/AlimentacaoChatPage";

import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/app" element={<Exercicios />} />
        <Route path="/exercicio/:id" element={<ExercicioDetalhe />} />
        <Route path="/motivacional" element={<MensagemMotivacional />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat-alimentacao" element={<AlimentacaoChatPage />} />
      </Routes>
    </div>
  );
}

export default App;
