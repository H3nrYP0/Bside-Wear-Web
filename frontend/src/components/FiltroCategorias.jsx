function FiltroCategorias({ categorias, seleccionada, onSeleccionar }) {
  return (
    <div>
      <h3 className="font-bold text-bside-black mb-3 text-lg">
        Categorías
      </h3>
      <ul className="space-y-1">
        <li>
          <button
            onClick={() => onSeleccionar(null)}
            className={`w-full text-left px-3 py-2 rounded transition ${
              seleccionada === null
                ? "bg-bside-blue text-white font-semibold"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            Todas
          </button>
        </li>
        {categorias.map((cat) => (
          <li key={cat.id}>
            <button
              onClick={() => onSeleccionar(cat.id)}
              className={`w-full text-left px-3 py-2 rounded transition ${
                seleccionada === cat.id
                  ? "bg-bside-blue text-white font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {cat.nombre}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FiltroCategorias;