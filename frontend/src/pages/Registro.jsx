import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Registro() {
  const navigate = useNavigate();
  const { registro, login } = useAuth();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const validar = () => {
    if (!nombre.trim() || !email.trim() || !password || !confirmar) {
      return "Todos los campos son obligatorios";
    }
    if (nombre.trim().length < 2) {
      return "El nombre debe tener al menos 2 caracteres";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "El correo no es válido";
    }
    if (password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }
    if (password !== confirmar) {
      return "Las contraseñas no coinciden";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const errorValidacion = validar();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setEnviando(true);
    try {
      await registro(nombre.trim(), email.trim(), password);
      await login(email.trim(), password);
      navigate("/");
    } catch (err) {
      const mensaje =
        err.response?.data?.error ||
        "No se pudo completar el registro. Intenta de nuevo.";
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
        Crear cuenta
      </h1>
      <p className="mb-8" style={{ color: "var(--bside-gray-500)" }}>
        Únete al lado B de la creatividad.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="input"
            placeholder="Tu nombre"
            autoComplete="name"
          />
        </div>

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
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="label">Confirmar contraseña</label>
          <input
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            className="input"
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
          />
        </div>

        {error && <div className="alert-error">{error}</div>}

        <button
          type="submit"
          disabled={enviando}
          className="btn btn-primary btn-full"
        >
          {enviando ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="text-center mt-6" style={{ color: "var(--bside-gray-500)" }}>
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="link-primary">
          Ingresa
        </Link>
      </p>
    </div>
  );
}

export default Registro;