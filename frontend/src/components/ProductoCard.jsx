import { Link } from "react-router-dom";

function ProductoCard({ producto }) {
  // Ahora usamos la imagen real que viene del backend
  const imagen = producto.imagen_principal;

  return (
    <Link
      to={`/catalogo/${producto.id}`}
      className="group block border-2 border-bside-black rounded-lg overflow-hidden hover:shadow-lg transition"
    >
      {/* Imagen o placeholder */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
        {imagen ? (
          <img
            src={imagen}
            alt={producto.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-bside-blue flex items-center justify-center text-white text-4xl font-bold">
            B
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {producto.personalizable && (
            <span
              className="badge"
              style={{
                backgroundColor: "var(--bside-yellow)",
                color: "var(--bside-black)",
                fontSize: "0.6rem",
                padding: "0.15rem 0.5rem",
                marginBottom: "0.5rem",
                display: "inline-block",
              }}
            >
              Personalizable
            </span>
          )}
        <h3 className="font-bold text-bside-black mb-1 line-clamp-2">
          {producto.nombre}
        </h3>

        {producto.tipo_corte && (
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            {producto.tipo_corte}
          </p>
        )}

        <div className="flex items-center gap-2">
          {producto.en_oferta && producto.porcentaje_descuento ? (
            <>
              <span className="text-lg font-bold text-bside-orange">
                ${producto.precio_final.toLocaleString("es-CO")}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ${producto.precio_venta.toLocaleString("es-CO")}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-bside-blue">
              ${producto.precio_venta.toLocaleString("es-CO")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ProductoCard;