import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { productosAPI } from "../api/endpoints";
import SelectorPrenda from "../components/Personalizador/SelectorPrenda";
import SelectorDiseno from "../components/Personalizador/SelectorDiseno";
import AreaTrabajo from "../components/Personalizador/AreaTrabajo";

function Personalizador() {
  const { productoId } = useParams();

  const [paso, setPaso] = useState(1);
  const [prenda, setPrenda] = useState(null);
  const [diseno, setDiseno] = useState(null);
  const [cargandoInicial, setCargandoInicial] = useState(Boolean(productoId));

  // Si viene un productoId en la URL, cargarlo directo
  useEffect(() => {
    if (!productoId) return;

    productosAPI
      .obtener(productoId)
      .then((res) => {
        setPrenda(res.data.producto);
        setPaso(2);
      })
      .catch(() => {
        setPaso(1);
      })
      .finally(() => setCargandoInicial(false));
  }, [productoId]);

  const handleSeleccionarPrenda = (p) => {
    setPrenda(p);
    setPaso(2);
  };

  const handleSeleccionarDiseno = (d) => {
    setDiseno(d);
    setPaso(3);
  };

  const volverPaso = (nuevoPaso) => {
    setPaso(nuevoPaso);
  };

  if (cargandoInicial) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p style={{ color: "var(--bside-blue)" }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="mb-8">
        <h1
          className="text-4xl font-bold mb-2"
          style={{ fontFamily: "Baloo 2", color: "var(--bside-black)" }}
        >
          Personaliza tu prenda
        </h1>
        <p style={{ color: "var(--bside-gray-500)" }}>
          Elige una prenda, selecciona un diseño, ajústalo a tu gusto.
        </p>
      </div>

      {/* Indicador de pasos */}
      <div className="flex items-center gap-2 mb-8">
        <Paso numero={1} actual={paso} etiqueta="Prenda" />
        <Linea activa={paso >= 2} />
        <Paso numero={2} actual={paso} etiqueta="Diseño" />
        <Linea activa={paso >= 3} />
        <Paso numero={3} actual={paso} etiqueta="Ajustar" />
      </div>

      {/* Contenido de cada paso */}
      {paso === 1 && (
        <SelectorPrenda
          productoSeleccionado={prenda}
          onSeleccionar={handleSeleccionarPrenda}
        />
      )}

      {paso === 2 && (
        <>
          <div className="mb-4">
            <button
              onClick={() => volverPaso(1)}
              className="link-primary text-sm"
              style={{ background: "none", border: "none" }}
            >
              ← Cambiar prenda
            </button>
          </div>
          <SelectorDiseno
            disenoSeleccionado={diseno}
            onSeleccionar={handleSeleccionarDiseno}
          />
        </>
      )}

      {paso === 3 && (
        <AreaTrabajo
          prenda={prenda}
          diseno={diseno}
          onVolver={() => volverPaso(2)}
        />
      )}
    </div>
  );
}

function Paso({ numero, actual, etiqueta }) {
  const activo = actual >= numero;
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
        style={{
          backgroundColor: activo ? "var(--bside-blue)" : "#e5e5e5",
          color: activo ? "white" : "#737373",
        }}
      >
        {numero}
      </div>
      <span
        className="text-sm font-medium"
        style={{ color: activo ? "var(--bside-black)" : "#737373" }}
      >
        {etiqueta}
      </span>
    </div>
  );
}

function Linea({ activa }) {
  return (
    <div
      className="flex-1 h-0.5"
      style={{ backgroundColor: activa ? "var(--bside-blue)" : "#e5e5e5" }}
    />
  );
}

export default Personalizador;