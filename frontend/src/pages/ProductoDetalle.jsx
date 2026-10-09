import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { productosAPI, variantesAPI } from "../api/endpoints";
import { useCarritoStore } from "../store/carritoStore";

function ProductoDetalle() {
  const { id } = useParams();

  const [producto, setProducto] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [imagenActiva, setImagenActiva] = useState(0);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  const agregarAlCarrito = useCarritoStore((s) => s.agregar);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    setCargando(true);
    setError(null);

    Promise.all([
      productosAPI.obtener(id),
      variantesAPI.listarDeProducto(id),
    ])
      .then(([resProducto, resVariantes]) => {
        setProducto(resProducto.data.producto);
        setVariantes(resVariantes.data.variantes);
        // Si solo hay una variante, seleccionarla automáticamente
        if (resVariantes.data.variantes.length === 1) {
          setVarianteSeleccionada(resVariantes.data.variantes[0]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-bside-blue">
        Cargando producto...
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-xl text-gray-600 mb-4">
          Producto no encontrado.
        </p>
        <Link
          to="/catalogo"
          className="text-bside-blue font-semibold hover:text-bside-orange transition"
        >
          ← Volver al catálogo
        </Link>
      </div>
    );
  }

  const imagenes = producto.imagenes || [];
  const tieneImagenes = imagenes.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/catalogo" className="hover:text-bside-blue">
          Catálogo
        </Link>
        <span className="mx-2">/</span>
        <span className="text-bside-black">{producto.nombre}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Galería */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
            {tieneImagenes ? (
              <img
                src={imagenes[imagenActiva]}
                alt={producto.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-bside-blue flex items-center justify-center text-white text-8xl font-bold">
                B
              </div>
            )}
          </div>

          {imagenes.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {imagenes.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setImagenActiva(i)}
                  className={`aspect-square rounded overflow-hidden border-2 transition ${
                    i === imagenActiva
                      ? "border-bside-blue"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={url}
                    alt={`${producto.nombre} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {producto.personalizable && (
            <span
              className="badge"
              style={{
                backgroundColor: "var(--bside-yellow)",
                color: "var(--bside-black)",
                marginBottom: "0.75rem",
                display: "inline-block",
              }}
            >
              Personalizable
            </span>
          )}
          <h1
            className="text-3xl md:text-4xl font-bold mb-2 text-bside-black"
            style={{ fontFamily: "Baloo 2" }}
          >
            {producto.nombre}
          </h1>

          {producto.tipo_corte && (
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-4">
              Corte {producto.tipo_corte}
            </p>
          )}

          {/* Precio */}
          <div className="mb-6">
            {producto.en_oferta && producto.porcentaje_descuento ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-bside-orange">
                  ${producto.precio_final.toLocaleString("es-CO")}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  ${producto.precio_venta.toLocaleString("es-CO")}
                </span>
                <span className="bg-bside-orange text-white text-sm font-bold px-2 py-1 rounded">
                  -{producto.porcentaje_descuento}%
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-bside-blue">
                ${producto.precio_venta.toLocaleString("es-CO")}
              </span>
            )}
          </div>

          {/* Descripción */}
          {producto.descripcion && (
            <p className="text-gray-700 mb-6">{producto.descripcion}</p>
          )}

          {/* Variantes */}
          {variantes.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-3 text-bside-black">
                Selecciona una opción
              </h3>
              <div className="flex flex-wrap gap-2">
                {variantes.map((v) => {
                  const etiqueta = [v.talla, v.color]
                    .filter(Boolean)
                    .join(" / ") || "Única";
                  const sinStock = v.stock === 0;

                  return (
                    <button
                      key={v.id}
                      disabled={sinStock}
                      onClick={() => setVarianteSeleccionada(v)}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition ${
                        sinStock
                          ? "border-gray-200 text-gray-400 cursor-not-allowed line-through"
                          : varianteSeleccionada?.id === v.id
                          ? "border-bside-blue bg-bside-blue text-white"
                          : "border-bside-black text-bside-black hover:border-bside-blue"
                      }`}
                    >
                      {etiqueta}
                    </button>
                  );
                })}
              </div>
              {varianteSeleccionada && (
                <p className="text-sm text-gray-500 mt-2">
                  {varianteSeleccionada.stock > 0
                    ? `Stock disponible: ${varianteSeleccionada.stock}`
                    : "Sin stock"}
                </p>
              )}
            </div>
          )}

          {/* Botón personalizar (si aplica) */}
          {producto.personalizable && (
            <Link
              to={`/personalizar/${producto.id}`}
              className="btn btn-secondary btn-full mb-3"
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              Personalizar esta prenda
            </Link>
          )}

          {/* Botón agregar al carrito */}
          <button
            disabled={!varianteSeleccionada || varianteSeleccionada.stock === 0}
            onClick={() => {
              if (!varianteSeleccionada) return;
              agregarAlCarrito({
                variante_id: varianteSeleccionada.id,
                producto_id: producto.id,
                producto_nombre: producto.nombre,
                variante_talla: varianteSeleccionada.talla,
                variante_color: varianteSeleccionada.color,
                precio_unitario: producto.precio_final,
                imagen_principal: producto.imagen_principal || null,
                stock_disponible: varianteSeleccionada.stock,
                cantidad: 1,
              });
              setAgregado(true);
              setTimeout(() => setAgregado(false), 2000);
            }}
            className={`w-full py-3 rounded-full font-bold text-lg transition ${
              !varianteSeleccionada || varianteSeleccionada.stock === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : agregado
                ? "bg-green-500 text-white"
                : "bg-bside-blue text-white hover:bg-bside-orange"
            }`}
          >
            {varianteSeleccionada && varianteSeleccionada.stock === 0
              ? "Sin stock"
              : !varianteSeleccionada
              ? "Selecciona una opción"
              : agregado
              ? "Agregado al carrito"
              : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductoDetalle;