import { Link } from "react-router-dom";

function Home() {
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

      {/* Bloque temporal para verificar que el layout funciona */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 text-bside-black"
            style={{ fontFamily: "Baloo 2" }}
          >
            Próximamente
          </h2>
          <p className="text-lg text-gray-600">
            Aquí irán los productos destacados.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Home;