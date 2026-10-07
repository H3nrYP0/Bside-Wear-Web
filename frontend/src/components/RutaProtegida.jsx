import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function RutaProtegida({ children, soloAdmin = false }) {
  const { estaAutenticado, esAdmin, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-bside-blue">
        Cargando...
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (soloAdmin && !esAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1
          className="text-4xl font-bold mb-4 text-bside-black"
          style={{ fontFamily: "Baloo 2" }}
        >
          Acceso denegado
        </h1>
        <p className="text-gray-600">
          Esta sección es solo para administradores.
        </p>
      </div>
    );
  }

  return children;
}

export default RutaProtegida;