import { useEffect, useState } from "react";
import { dashboardAPI } from "../../api/endpoints";

function AdminDashboard() {
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboardAPI
      .resumen()
      .then((res) => setResumen(res.data))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return <p style={{ color: "var(--bside-blue)" }}>Cargando panel...</p>;
  }

  if (error) {
    return <div className="alert-error">{error}</div>;
  }

  const { cantidades, pedidos, stock } = resumen;

  return (
    <div>
      <h1
        className="text-3xl font-bold mb-6"
        style={{ fontFamily: "Baloo 2", color: "var(--bside-black)" }}
      >
        Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Tarjeta
          titulo="Categorías"
          valor={cantidades.categorias_activas}
          color="var(--bside-blue)"
        />
        <Tarjeta
          titulo="Productos"
          valor={cantidades.productos_activos}
          color="var(--bside-orange)"
        />
        <Tarjeta
          titulo="Variantes"
          valor={cantidades.variantes_activas}
          color="var(--bside-gold)"
        />
        <Tarjeta
          titulo="Clientes"
          valor={cantidades.clientes_registrados}
          color="var(--bside-black)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Tarjeta
          titulo="Pedidos totales"
          valor={pedidos.total}
          color="var(--bside-blue)"
        />
        <Tarjeta
          titulo="Pedidos pendientes"
          valor={pedidos.pendientes}
          color="var(--bside-orange)"
          destacado={pedidos.pendientes > 0}
        />
        <Tarjeta
          titulo="Ingresos totales"
          valor={`$${pedidos.ingresos_totales.toLocaleString("es-CO")}`}
          color="var(--bside-black)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Tarjeta
          titulo="Stock total"
          valor={stock.stock_total_disponible}
          color="var(--bside-blue)"
        />
        <Tarjeta
          titulo="Variantes con stock bajo"
          valor={stock.variantes_stock_bajo}
          color="var(--bside-gold)"
          destacado={stock.variantes_stock_bajo > 0}
        />
        <Tarjeta
          titulo="Variantes sin stock"
          valor={stock.variantes_sin_stock}
          color="var(--bside-orange)"
          destacado={stock.variantes_sin_stock > 0}
        />
      </div>
    </div>
  );
}

function Tarjeta({ titulo, valor, color, destacado = false }) {
  return (
    <div
      className="bg-white rounded-lg p-5 border"
      style={{
        borderColor: destacado ? color : "#e5e5e5",
        borderWidth: destacado ? "2px" : "1px",
      }}
    >
      <p className="text-sm mb-1" style={{ color: "var(--bside-gray-500)" }}>
        {titulo}
      </p>
      <p
        className="text-2xl font-bold"
        style={{ fontFamily: "Baloo 2", color }}
      >
        {valor}
      </p>
    </div>
  );
}

export default AdminDashboard;