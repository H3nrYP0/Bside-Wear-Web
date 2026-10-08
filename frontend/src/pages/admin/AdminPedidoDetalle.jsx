import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { pedidosAPI } from "../../api/endpoints";

const ESTADOS = [
  { valor: "pendiente", etiqueta: "Pendiente", color: "var(--bside-orange)" },
  { valor: "confirmado", etiqueta: "Confirmado", color: "var(--bside-blue)" },
  { valor: "enviado", etiqueta: "Enviado", color: "var(--bside-gold)" },
  { valor: "entregado", etiqueta: "Entregado", color: "#22c55e" },
  { valor: "cancelado", etiqueta: "Cancelado", color: "#737373" },
];

function AdminPedidoDetalle() {
  const { id } = useParams();

  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cambiando, setCambiando] = useState(false);

  const cargar = () => {
    setCargando(true);
    pedidosAPI
      .adminObtener(id)
      .then((res) => setPedido(res.data.pedido))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCambiarEstado = async (nuevoEstado) => {
    if (!window.confirm(`¿Cambiar el estado a "${nuevoEstado}"?`)) return;

    setCambiando(true);
    try {
      await pedidosAPI.adminCambiarEstado(id, nuevoEstado);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || "No se pudo cambiar el estado");
    } finally {
      setCambiando(false);
    }
  };

  if (cargando) {
    return <p style={{ color: "var(--bside-blue)" }}>Cargando pedido...</p>;
  }

  if (error || !pedido) {
    return <div className="alert-error">{error || "Pedido no encontrado"}</div>;
  }

  const estadoInfo =
    ESTADOS.find((e) => e.valor === pedido.estado) || {
      etiqueta: pedido.estado,
      color: "#737373",
    };

  return (
    <div>
      <Link to="/admin/pedidos" className="link-primary text-sm">
        ← Volver a pedidos
      </Link>

      <div className="flex items-center justify-between mt-4 mb-6">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "Baloo 2", color: "var(--bside-black)" }}
          >
            Pedido #{pedido.id}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--bside-gray-500)" }}>
            {new Date(pedido.fecha_creacion).toLocaleString("es-CO")}
          </p>
        </div>
        <span
          className="badge"
          style={{
            backgroundColor: estadoInfo.color,
            color: "white",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
          }}
        >
          {estadoInfo.etiqueta}
        </span>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-4">
        {/* Columna principal */}
        <div className="space-y-4">
          {/* Datos de envío */}
          <div
            className="bg-white rounded-lg border p-6"
            style={{ borderColor: "#e5e5e5" }}
          >
            <h2
              className="font-bold text-lg mb-4"
              style={{ color: "var(--bside-black)" }}
            >
              Datos de envío
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <span style={{ color: "var(--bside-gray-500)" }}>Nombre: </span>
                <span className="font-medium">{pedido.nombre_cliente}</span>
              </div>
              <div>
                <span style={{ color: "var(--bside-gray-500)" }}>Teléfono: </span>
                <span className="font-medium">{pedido.telefono_cliente}</span>
              </div>
              <div>
                <span style={{ color: "var(--bside-gray-500)" }}>Dirección: </span>
                <span className="font-medium">{pedido.direccion_envio}</span>
              </div>
              {pedido.notas && (
                <div>
                  <span style={{ color: "var(--bside-gray-500)" }}>Notas: </span>
                  <span className="font-medium">{pedido.notas}</span>
                </div>
              )}
            </div>
          </div>

          {/* Detalles */}
          <div
            className="bg-white rounded-lg border p-6"
            style={{ borderColor: "#e5e5e5" }}
          >
            <h2
              className="font-bold text-lg mb-4"
              style={{ color: "var(--bside-black)" }}
            >
              Productos
            </h2>
            <div className="space-y-3">
              {pedido.detalles.map((d) => (
                <div
                  key={d.id}
                  className="flex items-start justify-between py-2 border-b last:border-0"
                  style={{ borderColor: "#e5e5e5" }}
                >
                  <div>
                    <p className="font-medium">{d.producto_nombre}</p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--bside-gray-500)" }}
                    >
                      {[d.variante_talla, d.variante_color]
                        .filter(Boolean)
                        .join(" / ") || "Única"}
                      {" · x"}
                      {d.cantidad}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: "var(--bside-blue)" }}>
                      ${d.subtotal.toLocaleString("es-CO")}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--bside-gray-500)" }}
                    >
                      ${d.precio_unitario.toLocaleString("es-CO")} c/u
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="flex justify-between font-bold text-lg mt-4 pt-4 border-t"
              style={{ borderColor: "#e5e5e5" }}
            >
              <span>Total</span>
              <span style={{ color: "var(--bside-blue)" }}>
                ${pedido.total.toLocaleString("es-CO")}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar: cambiar estado */}
        <aside>
          <div
            className="bg-white rounded-lg border p-6 sticky top-20"
            style={{ borderColor: "#e5e5e5" }}
          >
            <h2
              className="font-bold text-lg mb-4"
              style={{ color: "var(--bside-black)" }}
            >
              Cambiar estado
            </h2>

            <div className="space-y-2">
              {ESTADOS.map((e) => (
                <button
                  key={e.valor}
                  onClick={() => handleCambiarEstado(e.valor)}
                  disabled={cambiando || pedido.estado === e.valor}
                  className="w-full text-left px-3 py-2 rounded-lg border transition text-sm"
                  style={{
                    borderColor: pedido.estado === e.valor ? e.color : "#e5e5e5",
                    backgroundColor:
                      pedido.estado === e.valor ? e.color : "white",
                    color: pedido.estado === e.valor ? "white" : "var(--bside-black)",
                    fontWeight: pedido.estado === e.valor ? "700" : "500",
                    cursor:
                      cambiando || pedido.estado === e.valor
                        ? "not-allowed"
                        : "pointer",
                    opacity: cambiando ? 0.6 : 1,
                  }}
                >
                  {e.etiqueta}
                </button>
              ))}
            </div>

            {pedido.estado === "cancelado" && (
              <p
                className="text-xs mt-4"
                style={{ color: "var(--bside-gray-500)" }}
              >
                Este pedido fue cancelado. El stock de sus productos fue devuelto.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AdminPedidoDetalle;