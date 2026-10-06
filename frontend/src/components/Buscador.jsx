import { useState } from "react";

function Buscador({ onBuscar }) {
  const [texto, setTexto] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onBuscar(texto.trim());
  };

  const handleLimpiar = () => {
    setTexto("");
    onBuscar("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Buscar productos..."
        className="flex-1 px-3 py-2 border-2 border-bside-black rounded-lg focus:outline-none focus:border-bside-blue transition"
      />
      {texto && (
        <button
          type="button"
          onClick={handleLimpiar}
          className="px-3 py-2 text-gray-500 hover:text-bside-orange transition"
          aria-label="Limpiar búsqueda"
        >
          ✕
        </button>
      )}
      <button
        type="submit"
        className="px-4 py-2 bg-bside-blue text-white font-semibold rounded-lg hover:bg-bside-orange transition"
      >
        Buscar
      </button>
    </form>
  );
}

export default Buscador;