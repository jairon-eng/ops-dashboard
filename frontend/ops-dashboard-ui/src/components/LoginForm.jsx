import { useState } from "react";
import { apiLogin } from "../api";
import { setToken } from "../auth/token";

export default function LoginForm({ onSuccess, message }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123!");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await apiLogin(username, password);
      setToken(res.accessToken);
      onSuccess();
    } catch (err) {
      setError(err.message || "Login inválido");
    }
  }

  return (
    <div className="container">
      <section className="card form-section">
        <h2>Login</h2>
        <p className="subtitle">Usa admin / admin123!</p>

        {message && <div className="error">{message}</div>}
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button className="btn-primary" type="submit">
            Entrar
          </button>
        </form>
      </section>
    </div>
  );
}