import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { pedidosAPI } from "../api/endpoints";

function MisPedidos() {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    pedidosAPI
      .miPedido(id)
      .then((res) => setPedido(res.data.pedido))
      .catch((err) =>
        setError(err.response?.data?.error || "Pedido no encontrado")
      )
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-bside-blue">
        Cargando pedido...
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-xl text-gray-600 mb-4">{error || "Pedido no encontrado"}</p>
        <Link
          to="/catalogo"
          className="text-bside-blue font-semibold hover:text-bside-orange transition"
        >
          ← Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1
          className="text-4xl font-bold mb-2 text-bside-black"
          style={{ fontFamily: "Baloo 2" }}
        >
          Pedido confirmado
        </h1>
        <p className="text-gray-600">
          Gracias por tu compra. Nos pondremos en contacto pronto.
        </p>
      </div>

      <div className="border-2 border-bside-black rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">Pedido</p>
            <p className="font-bold text-lg">#{pedido.id}</p>
          </div>
          <span className="px-3 py-1 bg-bside-yellow text-bside-black font-bold text-sm uppercase rounded-full">
            {pedido.estado}
          </span>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Envío</p>
          <p className="font-medium">{pedido.nombre_cliente}</p>
          <p className="text-sm text-gray-700">{pedido.telefono_cliente}</p>
          <p className="text-sm text-gray-700">{pedido.direccion_envio}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">Productos</p>
          <ul className="space-y-2">
            {pedido.detalles.map((d) => (
              <li
                key={d.id}
                className="flex justify-between text-sm border-b border-gray-100 pb-2"
              >
                <span>
                  {d.producto_nombre}
                  {d.variante_talla && ` / ${d.variante_talla}`}
                  {d.variante_color && ` / ${d.variante_color}`} x{d.cantidad}
                </span>
                <span className="font-medium">
                  ${d.subtotal.toLocaleString("es-CO")}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-gray-300 pt-4 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-bside-blue">
            ${pedido.total.toLocaleString("es-CO")}
          </span>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link
          to="/catalogo"
          className="text-bside-blue font-semibold hover:text-bside-orange transition"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}

export default MisPedidos;