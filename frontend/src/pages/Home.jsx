import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productosAPI } from "../api/endpoints";
import ProductoCard from "../components/ProductoCard";

function Home() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    productosAPI
      .listar({ per_page: 8 })
      .then((res) => setProductos(res.data.productos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-bside-blue text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1
            className="text-5xl md:text-7xl font-extrabold mb-4"
            style={{ fontFamily: "Baloo 2" }}
          >
            B-Side Wear
          </h1>
          <p className="text-xl md:text-2xl text-bside-yellow font-medium mb-8">
            Fuera de la cuadrícula
          </p>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-blue-100">
            No somos tendencia masiva. Somos el reverso del disco. Streetwear
            con identidad propia desde Medellín.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/catalogo"
              className="px-8 py-3 bg-bside-yellow text-bside-black font-bold rounded-full hover:bg-bside-orange hover:text-white transition"
            >
              Ver catálogo
            </Link>
            <Link
              to="/personalizar"
              className="px-8 py-3 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-bside-blue transition"
            >
              Personalizar prenda
            </Link>
          </div>
        </div>
      </section>

      {/* Productos */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2
              className="text-3xl md:text-4xl font-bold text-bside-black"
              style={{ fontFamily: "Baloo 2" }}
            >
              Productos destacados
            </h2>
            <Link
              to="/catalogo"
              className="text-bside-blue font-semibold hover:text-bside-orange transition"
            >
              Ver todos →
            </Link>
          </div>

          {cargando && (
            <p className="text-bside-blue text-center py-8">Cargando productos...</p>
          )}

          {error && (
            <p className="text-bside-orange text-center py-8">
              Error al cargar productos: {error}
            </p>
          )}

          {!cargando && !error && productos.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              Aún no hay productos disponibles.
            </p>
          )}

          {!cargando && !error && productos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productos.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Personalización */}
      <section className="bg-bside-yellow py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 text-bside-black"
            style={{ fontFamily: "Baloo 2" }}
          >
            ¿Tienes una idea en mente?
          </h2>
          <p className="text-lg text-bside-black mb-8 max-w-2xl mx-auto">
            Personaliza tu prenda con nuestros diseños, ajusta el tamaño y la
            posición. Tú mandas.
          </p>
          <Link
            to="/personalizar"
            className="inline-block px-8 py-3 bg-bside-black text-white font-bold rounded-full hover:bg-bside-blue transition"
          >
            Ir al personalizador
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;