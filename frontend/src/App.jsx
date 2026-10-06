import { useEffect, useState } from "react";
import { categoriasAPI } from "./api/endpoints";

function App() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    categoriasAPI
      .listar()
      .then((res) => setCategorias(res.data.categorias))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="min-h-screen p-8 bg-white">
      <h1 className="text-3xl font-bold mb-6 text-bside-black">
        Categorías desde Render
      </h1>

      {cargando && <p className="text-bside-blue">Cargando...</p>}
      {error && (
        <p className="text-bside-orange">Error: {error}</p>
      )}

      <ul className="space-y-2">
        {categorias.map((cat) => (
          <li
            key={cat.id}
            className="p-4 border-2 border-bside-black rounded-lg hover:bg-bside-yellow transition"
          >
            <strong className="text-bside-blue">{cat.nombre}</strong>{" "}
            — {cat.descripcion}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;