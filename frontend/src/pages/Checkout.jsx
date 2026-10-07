import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCarritoStore } from "../store/carritoStore";
import { useAuth } from "../hooks/useAuth";
import { pedidosAPI } from "../api/endpoints";

function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrecio, vaciar } = useCarritoStore();
  const { estaAutenticado, usuario } = useAuth();

  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Si el carrito está vacío, redirigir
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-xl text-gray-600 mb-6">
          Tu carrito está vacío.
        </p>
        <Link
          to="/catalogo"
          className="inline-block px-8 py-3 bg-bside-blue text-white font-bold rounded-full hover:bg-bside-orange transition"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  // Si no está autenticado, mostrar aviso
  if (!estaAutenticado) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1
          className="text-3xl font-bold mb-4 text-bside-black"
          style={{ fontFamily: "Baloo 2" }}
        >
          Necesitas iniciar sesión
        </h1>
        <p className="text-gray-600 mb-8">
          Para completar tu compra debes ingresar a tu cuenta.
        </p>
        <Link
          to="/login"
          className="inline-block px-8 py-3 bg-bside-blue text-white font-bold rounded-full hover:bg-bside-orange transition"
        >
          Ingresar
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim() || !telefono.trim() || !direccion.trim()) {
      setError("Nombre, teléfono y dirección son obligatorios");
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        items: items.map((i) => ({
          variante_id: i.variante_id,
          cantidad: i.cantidad,
        })),
        nombre_cliente: nombre.trim(),
        telefono_cliente: telefono.trim(),
        direccion_envio: direccion.trim(),
        notas: notas.trim() || undefined,
      };

      const res = await pedidosAPI.crear(payload);

      // Vaciar carrito
      vaciar();

      // Redirigir al detalle del pedido
      const pedidoId = res.data.pedido.id;
      navigate(`/mis-pedidos/${pedidoId}`);
    } catch (err) {
      const mensaje =
        err.response?.data?.error ||
        "No se pudo crear el pedido. Intenta de nuevo.";
      setError(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1
        className="text-4xl font-bold mb-8 text-bside-black"
        style={{ fontFamily: "Baloo 2" }}
      >
        Finalizar compra
      </h1>

      <div className="grid md:grid-cols-[1fr_320px] gap-8">
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="font-bold text-lg text-bside-black">
            Datos de envío
          </h2>

          <div>
            <label className="block font-medium mb-1 text-bside-black">
              Nombre completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 border-2 border-bside-black rounded-lg focus:outline-none focus:border-bside-blue transition"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-bside-black">
              Teléfono
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full px-4 py-2 border-2 border-bside-black rounded-lg focus:outline-none focus:border-bside-blue transition"
              placeholder="3001234567"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-bside-black">
              Dirección de envío
            </label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full px-4 py-2 border-2 border-bside-black rounded-lg focus:outline-none focus:border-bside-blue transition"
              placeholder="Calle 123 #45-67, barrio, ciudad"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-bside-black">
              Notas (opcional)
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border-2 border-bside-black rounded-lg focus:outline-none focus:border-bside-blue transition resize-none"
              placeholder="Indicaciones especiales, referencias, etc."
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-bside-orange text-bside-orange px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={enviando}
            className={`w-full py-3 rounded-full font-bold transition ${
              enviando
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-bside-blue text-white hover:bg-bside-orange"
            }`}
          >
            {enviando ? "Procesando..." : "Confirmar pedido"}
          </button>
        </form>

        {/* Resumen del carrito */}
        <aside className="bg-gray-50 rounded-lg p-6 h-fit">
          <h2 className="font-bold text-lg mb-4 text-bside-black">
            Tu pedido
          </h2>

          <ul className="space-y-3 mb-4">
            {items.map((item) => (
              <li
                key={item.variante_id}
                className="flex justify-between text-sm"
              >
                <span className="text-gray-700">
                  {item.producto_nombre} x{item.cantidad}
                </span>
                <span className="font-medium">
                  $
                  {(item.precio_unitario * item.cantidad).toLocaleString(
                    "es-CO"
                  )}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t border-gray-300 pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-bside-blue">
                ${totalPrecio().toLocaleString("es-CO")}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;