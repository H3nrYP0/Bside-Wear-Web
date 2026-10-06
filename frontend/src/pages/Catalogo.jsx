import { useEffect, useState } from "react";
import { categoriasAPI, productosAPI } from "../api/endpoints";
import ProductoCard from "../components/ProductoCard";
import FiltroCategorias from "../components/FiltroCategorias";
import Buscador from "../components/Buscador";

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [search, setSearch] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Cargar categorías una sola vez
  useEffect(() => {
    categoriasAPI
      .listar()
      .then((res) => setCategorias(res.data.categorias))
      .catch(() => {});
  }, []);

  // Cargar productos cuando cambian los filtros
  useEffect(() => {
    setCargando(true);
    setError(null);

    const params = { per_page: 50 };
    if (categoriaSeleccionada) params.categoria_id = categoriaSeleccionada;
    if (search) params.search = search;

    productosAPI
      .listar(params)
      .then((res) => setProductos(res.data.productos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [categoriaSeleccionada, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="mb-8">
        <h1
          className="text-4xl md:text-5xl font-bold mb-2 text-bside-black"
          style={{ fontFamily: "Baloo 2" }}
        >
          Catálogo
        </h1>
        <p className="text-gray-600">
          Explora todas nuestras prendas y accesorios.
        </p>
      </div>

      <div className="grid md:grid-cols-[250px_1fr] gap-8">
        {/* Sidebar de filtros */}
        <aside className="space-y-6">
          <Buscador onBuscar={setSearch} />
          <FiltroCategorias
            categorias={categorias}
            seleccionada={categoriaSeleccionada}
            onSeleccionar={setCategoriaSeleccionada}
          />
        </aside>

        {/* Grid de productos */}
        <main>
          {cargando && (
            <div className="text-center py-16 text-bside-blue font-medium">
              Cargando productos...
            </div>
          )}

          {error && (
            <div className="text-center py-16 text-bside-orange">
              Error al cargar productos: {error}
            </div>
          )}

          {!cargando && !error && productos.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 mb-2">
                No encontramos productos.
              </p>
              <p className="text-gray-400">
                Prueba con otros filtros o mira todo el catálogo.
              </p>
            </div>
          )}

          {!cargando && !error && productos.length > 0 && (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {productos.length} producto{productos.length !== 1 && "s"}{" "}
                encontrado{productos.length !== 1 && "s"}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {productos.map((producto) => (
                  <ProductoCard key={producto.id} producto={producto} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Catalogo;