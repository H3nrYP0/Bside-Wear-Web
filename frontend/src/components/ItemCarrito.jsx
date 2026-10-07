import { Link } from "react-router-dom";
import { useCarritoStore } from "../store/carritoStore";

function ItemCarrito({ item }) {
  const { cambiarCantidad, eliminar } = useCarritoStore();

  const etiqueta = [item.variante_talla, item.variante_color]
    .filter(Boolean)
    .join(" / ");

  const subtotal = item.precio_unitario * item.cantidad;

  return (
    <div className="flex gap-4 py-4 border-b border-gray-200">
      {/* Imagen */}
      <Link
        to={`/catalogo/${item.producto_id}`}
        className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden"
      >
        {item.imagen_principal ? (
          <img
            src={item.imagen_principal}
            alt={item.producto_nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-bside-blue flex items-center justify-center text-white text-2xl font-bold">
            B
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link
            to={`/catalogo/${item.producto_id}`}
            className="font-bold text-bside-black hover:text-bside-blue transition"
          >
            {item.producto_nombre}
          </Link>
          {etiqueta && (
            <p className="text-sm text-gray-500 mt-1">{etiqueta}</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Cantidad */}
          <div className="flex items-center border-2 border-bside-black rounded-full">
            <button
              onClick={() =>
                cambiarCantidad(item.variante_id, item.cantidad - 1)
              }
              disabled={item.cantidad <= 1}
              className={`w-8 h-8 flex items-center justify-center font-bold transition ${
                item.cantidad <= 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-bside-black hover:text-bside-blue"
              }`}
            >
              −
            </button>
            <span className="w-8 text-center font-semibold">
              {item.cantidad}
            </span>
            <button
              onClick={() =>
                cambiarCantidad(item.variante_id, item.cantidad + 1)
              }
              disabled={item.cantidad >= item.stock_disponible}
              className={`w-8 h-8 flex items-center justify-center font-bold transition ${
                item.cantidad >= item.stock_disponible
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-bside-black hover:text-bside-blue"
              }`}
            >
              +
            </button>
          </div>

          {/* Precio y eliminar */}
          <div className="flex items-center gap-4">
            <span className="font-bold text-bside-blue">
              ${subtotal.toLocaleString("es-CO")}
            </span>
            <button
              onClick={() => eliminar(item.variante_id)}
              className="text-gray-400 hover:text-bside-orange transition text-sm"
              aria-label="Eliminar"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemCarrito;