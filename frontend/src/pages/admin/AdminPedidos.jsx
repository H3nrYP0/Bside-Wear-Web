import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { pedidosAPI } from "../../api/endpoints";

const ESTADOS = [
  { valor: "pendiente", etiqueta: "Pendiente", color: "var(--bside-orange)" },
  { valor: "confirmado", etiqueta: "Confirmado", color: "var(--bside-blue)" },
  { valor: "enviado", etiqueta: "Enviado", color: "var(--bside-gold)" },
  { valor: "entregado", etiqueta: "Entregado", color: "#22c55e" },
  { valor: "cancelado", etiqueta: "Cancelado", color: "#737373" },
];

function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("");

  const cargar = () => {
    setCargando(true);
    setError(null);

    const params = {};
    if (filtroEstado) params.estado = filtroEstado;

    pedidosAPI
      .adminListarTodos(params)
      .then((res) => setPedidos(res.data.pedidos))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado]);

  const infoEstado = (estado) =>
    ESTADOS.find((e) => e.valor === estado) || {
      etiqueta: estado,
      color: "#737373",
    };

  return (
    <div>
      <h1
        className="text-3xl font-bold mb-6"
        style={{ fontFamily: "Baloo 2", color: "var(--bside-black)" }}
      >
        Pedidos
      </h1>

      {/* Filtros */}
      <div
        className="bg-white rounded-lg border p-4 mb-4"
        style={{ borderColor: "#e5e5e5" }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium">Filtrar por estado:</span>
          <button
            onClick={() => setFiltroEstado("")}
            className="badge"
            style={{
              backgroundColor:
                filtroEstado === "" ? "var(--bside-black)" : "#e5e5e5",
              color: filtroEstado === "" ? "white" : "#737373",
              cursor: "pointer",
              border: "none",
            }}
          >
            Todos
          </button>
          {ESTADOS.map((e) => (
            <button
              key={e.valor}
              onClick={() => setFiltroEstado(e.valor)}
              className="badge"
              style={{
                backgroundColor:
                  filtroEstado === e.valor ? e.color : "#e5e5e5",
                color: filtroEstado === e.valor ? "white" : "#737373",
                cursor: "pointer",
                border: "none",
              }}
            >
              {e.etiqueta}
            </button>
          ))}
        </div>
      </div>

      {cargando && (
        <p style={{ color: "var(--bside-blue)" }}>Cargando pedidos...</p>
      )}

      {error && <div className="alert-error">{error}</div>}

      {!cargando && !error && pedidos.length === 0 && (
        <p style={{ color: "var(--bside-gray-500)" }}>
          No hay pedidos{filtroEstado ? ` con estado "${infoEstado(filtroEstado).etiqueta}"` : ""}.
        </p>
      )}

      {!cargando && !error && pedidos.length > 0 && (
        <div
          className="bg-white rounded-lg border overflow-hidden"
          style={{ borderColor: "#e5e5e5" }}
        >
          <table className="w-full">
            <thead style={{ backgroundColor: "#f5f5f5" }}>
              <tr>
                <Th>Pedido</Th>
                <Th>Cliente</Th>
                <Th>Fecha</Th>
                <Th align="right">Total</Th>
                <Th>Estado</Th>
                <Th align="right">Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => {
                const estado = infoEstado(p.estado);
                return (
                  <tr key={p.id} style={{ borderTop: "1px solid #e5e5e5" }}>
                    <Td>
                      <span className="font-bold">#{p.id}</span>
                    </Td>
                    <Td>
                      <div className="font-medium">{p.nombre_cliente}</div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--bside-gray-500)" }}
                      >
                        {p.telefono_cliente}
                      </div>
                    </Td>
                    <Td>
                      <span style={{ color: "var(--bside-gray-500)" }}>
                        {new Date(p.fecha_creacion).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </Td>
                    <Td align="right">
                      <span
                        className="font-bold"
                        style={{ color: "var(--bside-blue)" }}
                      >
                        ${p.total.toLocaleString("es-CO")}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className="badge"
                        style={{ backgroundColor: estado.color, color: "white" }}
                      >
                        {estado.etiqueta}
                      </span>
                    </Td>
                    <Td align="right">
                      <Link
                        to={`/admin/pedidos/${p.id}`}
                        className="link-primary"
                      >
                        Ver
                      </Link>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children, align = "left" }) {
  return (
    <th
      className="px-4 py-3 text-sm font-semibold"
      style={{ textAlign: align, color: "var(--bside-black)" }}
    >
      {children}
    </th>
  );
}

function Td({ children, align = "left" }) {
  return (
    <td className="px-4 py-3 text-sm" style={{ textAlign: align }}>
      {children}
    </td>
  );
}

export default AdminPedidos;