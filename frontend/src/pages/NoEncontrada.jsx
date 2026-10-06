import { Link } from "react-router-dom";

function NoEncontrada() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <h1
        className="text-6xl font-bold mb-4 text-bside-blue"
        style={{ fontFamily: "Baloo 2" }}
      >
        404
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Esta página no está en el lado B.
      </p>
      <Link
        to="/"
        className="inline-block px-6 py-3 bg-bside-blue text-white font-semibold rounded-full hover:bg-bside-orange transition"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

export default NoEncontrada;