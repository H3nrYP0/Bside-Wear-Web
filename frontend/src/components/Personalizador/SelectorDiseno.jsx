import { useEffect, useState } from "react";
import { disenosAPI } from "../../api/endpoints";

function SelectorDiseno({ disenoSeleccionado, onSeleccionar }) {
  const [disenos, setDisenos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    disenosAPI
      .listar()
      .then((res) => setDisenos(res.data.disenos))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return <p style={{ color: "var(--bside-blue)" }}>Cargando diseños...</p>;
  }

  if (error) {
    return <div className="alert-error">{error}</div>;
  }

  if (disenos.length === 0) {
    return (
      <div
        className="text-center py-16 rounded-lg border"
        style={{ borderColor: "#e5e5e5", backgroundColor: "#fafafa" }}
      >
        <p className="text-lg" style={{ color: "var(--bside-gray-500)" }}>
          Aún no hay diseños disponibles.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2
        className="text-2xl font-bold mb-4"
        style={{ fontFamily: "Baloo 2", color: "var(--bside-black)" }}
      >
        Elige un diseño
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {disenos.map((d) => {
          const seleccionado = disenoSeleccionado?.id === d.id;
          return (
            <button
              key={d.id}
              onClick={() => onSeleccionar(d)}
              className="text-left rounded-lg overflow-hidden border-2 transition"
              style={{
                borderColor: seleccionado ? "var(--bside-blue)" : "#e5e5e5",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              <div
                className="aspect-square flex items-center justify-center p-3"
                style={{ backgroundColor: "#f9f9f9" }}
              >
                <img
                  src={d.url}
                  alt={d.nombre}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="p-3">
                <p className="font-bold text-sm">{d.nombre}</p>
                {d.descripcion && (
                  <p
                    className="text-xs line-clamp-2 mt-1"
                    style={{ color: "var(--bside-gray-500)" }}
                  >
                    {d.descripcion}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SelectorDiseno;