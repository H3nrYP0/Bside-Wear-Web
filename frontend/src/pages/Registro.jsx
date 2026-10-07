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
      // Login automático después del registro
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
        className="text-4xl font-bold mb-2 text-bside-black"
        style={{ fontFamily: "Baloo 2" }}
      >
        Crear cuenta
      </h1>
      <p className="text-gray-600 mb-8">
        Únete al lado B de la creatividad.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-medium mb-1 text-bside-black">
            Nombre
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-4 py-2 border-2 border-bside-black rounded-lg focus:outline-none focus:border-bside-blue transition"
            placeholder="Tu nombre"
            autoComplete="name"
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-bside-black">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border-2 border-bside-black rounded-lg focus:outline-none focus:border-bside-blue transition"
            placeholder="tu@correo.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-bside-black">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border-2 border-bside-black rounded-lg focus:outline-none focus:border-bside-blue transition"
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-bside-black">
            Confirmar contraseña
          </label>
          <input
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            className="w-full px-4 py-2 border-2 border-bside-black rounded-lg focus:outline-none focus:border-bside-blue transition"
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-bside-orange text-bside-orange px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className={`w-full py-3 rounded-full font-bold transition ${
            enviando
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-bside-blue text-white hover:bg-bside-orange"
          }`}
        >
          {enviando ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="text-center text-gray-600 mt-6">
        ¿Ya tienes cuenta?{" "}
        <Link
          to="/login"
          className="text-bside-blue font-semibold hover:text-bside-orange transition"
        >
          Ingresa
        </Link>
      </p>
    </div>
  );
}

export default Registro;