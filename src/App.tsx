import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Exercicios from "./components/Exercicios";
import "./App.css";

function App() {
  const [page, setPage] = useState("login"); // controla tela atual

  return (
    <div className="app-container">
      {page === "login" && <Login setPage={setPage} />}
      {page === "register" && <Register setPage={setPage} />}
      {page === "forgot" && <ForgotPassword setPage={setPage} />}
  {page === "app" && <Exercicios />}
    </div>
  );
}

export default App;
