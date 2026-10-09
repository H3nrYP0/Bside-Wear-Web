import { useEffect, useState } from "react";
import { productosAPI } from "../../api/endpoints";

function SelectorPrenda({ productoSeleccionado, onSeleccionar }) {
  const [prendas, setPrendas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    productosAPI
      .listar({ personalizable: true, per_page: 50 })
      .then((res) => setPrendas(res.data.productos))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return <p style={{ color: "var(--bside-blue)" }}>Cargando prendas...</p>;
  }

  if (error) {
    return <div className="alert-error">{error}</div>;
  }

  if (prendas.length === 0) {
    return (
      <div
        className="text-center py-16 rounded-lg border"
        style={{ borderColor: "#e5e5e5", backgroundColor: "#fafafa" }}
      >
        <p className="text-lg" style={{ color: "var(--bside-gray-500)" }}>
          Aún no hay prendas personalizables disponibles.
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
        Elige una prenda
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {prendas.map((p) => {
          const seleccionada = productoSeleccionado?.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSeleccionar(p)}
              className="text-left rounded-lg overflow-hidden border-2 transition"
              style={{
                borderColor: seleccionada ? "var(--bside-blue)" : "#e5e5e5",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              <div
                className="aspect-square flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: "#f5f5f5" }}
              >
                {p.imagen_principal ? (
                  <img
                    src={p.imagen_principal}
                    alt={p.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-4xl font-bold"
                    style={{ backgroundColor: "var(--bside-blue)" }}
                  >
                    B
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-bold text-sm mb-1">{p.nombre}</p>
                <p className="text-xs" style={{ color: "var(--bside-gray-500)" }}>
                  ${p.precio_venta.toLocaleString("es-CO")}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SelectorPrenda;