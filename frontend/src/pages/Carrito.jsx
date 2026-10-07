import { Link } from "react-router-dom";
import { useCarritoStore } from "../store/carritoStore";
import ItemCarrito from "../components/ItemCarrito";

function Carrito() {
  const { items, totalItems, totalPrecio, vaciar } = useCarritoStore();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1
          className="text-4xl font-bold mb-4"
          style={{ fontFamily: "Baloo 2", color: "var(--bside-black)" }}
        >
          Tu carrito está vacío
        </h1>
        <p className="mb-8" style={{ color: "var(--bside-gray-500)" }}>
          Explora el catálogo y encuentra algo del lado B.
        </p>
        <Link to="/catalogo" className="btn btn-primary">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-4xl font-bold"
          style={{ fontFamily: "Baloo 2", color: "var(--bside-black)" }}
        >
          Tu carrito
        </h1>
        <button
          onClick={vaciar}
          className="link-primary"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          Vaciar carrito
        </button>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-8">
        <div>
          {items.map((item) => (
            <ItemCarrito key={item.variante_id} item={item} />
          ))}
        </div>

        <aside
          className="rounded-lg p-6 h-fit md:sticky md:top-24"
          style={{ backgroundColor: "var(--bside-gray-100)" }}
        >
          <h2
            className="font-bold text-lg mb-4"
            style={{ color: "var(--bside-black)" }}
          >
            Resumen
          </h2>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--bside-gray-500)" }}>
                Productos ({totalItems()})
              </span>
              <span className="font-medium">
                ${totalPrecio().toLocaleString("es-CO")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--bside-gray-500)" }}>Envío</span>
              <span className="font-medium">Por definir</span>
            </div>
          </div>

          <div className="border-t pt-4 mb-6" style={{ borderColor: "#d4d4d4" }}>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span style={{ color: "var(--bside-blue)" }}>
                ${totalPrecio().toLocaleString("es-CO")}
              </span>
            </div>
          </div>

          <Link to="/checkout" className="btn btn-primary btn-full">
            Ir a pagar
          </Link>

          <Link
            to="/catalogo"
            className="btn btn-secondary btn-full mt-2"
          >
            Seguir comprando
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default Carrito;