import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Exercicios from "./components/Exercicios";
import ExercicioDetalhe from "./pages/ExercicioDetalhe";
import MensagemMotivacional from "./pages/MensagemMotivacional";
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
      </Routes>
    </div>
  );
}

export default App;
