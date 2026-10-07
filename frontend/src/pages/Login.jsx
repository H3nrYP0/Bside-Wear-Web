import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setEnviando(true);
    try {
      await login(email.trim(), password);
      navigate("/");
    } catch (err) {
      const mensaje =
        err.response?.data?.error ||
        "No se pudo iniciar sesión. Intenta de nuevo.";
      setError(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1
        className="text-4xl font-bold mb-2"
        style={{ fontFamily: "Baloo 2", color: "var(--bside-black)" }}
      >
        Ingresar
      </h1>
      <p className="mb-8" style={{ color: "var(--bside-gray-500)" }}>
        Bienvenido de vuelta al lado B.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="tu@correo.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="label">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="Tu contraseña"
            autoComplete="current-password"
          />
        </div>

        {error && <div className="alert-error">{error}</div>}

        <button
          type="submit"
          disabled={enviando}
          className="btn btn-primary btn-full"
        >
          {enviando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p className="text-center mt-6" style={{ color: "var(--bside-gray-500)" }}>
        ¿No tienes cuenta?{" "}
        <Link to="/registro" className="link-primary">
          Regístrate
        </Link>
      </p>
    </div>
  );
}

export default Login;