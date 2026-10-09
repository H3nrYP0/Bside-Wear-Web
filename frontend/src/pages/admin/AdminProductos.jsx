import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { categoriasAPI, productosAPI } from "../../api/endpoints";

function AdminProductos() {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [estado, setEstado] = useState("");

  const cargar = () => {
    setCargando(true);
    setError(null);

    const params = {};
    if (search) params.search = search;
    if (categoriaId) params.categoria_id = categoriaId;
    if (estado) params.estado = estado;

    productosAPI
      .adminListarTodos(params)
      .then((res) => setProductos(res.data.productos))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    categoriasAPI
      .adminListarTodas()
      .then((res) => setCategorias(res.data.categorias))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargar();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoriaId, estado]);

  const handleEliminar = async (producto) => {
    if (
      !window.confirm(
        `¿Eliminar el producto "${producto.nombre}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await productosAPI.eliminar(producto.id);
      cargar();
    } catch (err) {
      const mensaje = err.response?.data?.error || "No se pudo eliminar";
      alert(mensaje);
    }
  };

  const limpiarFiltros = () => {
    setSearch("");
    setCategoriaId("");
    setEstado("");
  };

  const hayFiltros = search || categoriaId || estado;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "Baloo 2", color: "var(--bside-black)" }}
        >
          Productos
        </h1>
        <Link to="/admin/productos/nuevo" className="btn btn-primary">
          Nuevo producto
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border p-4 mb-4" style={{ borderColor: "#e5e5e5" }}>
        <div className="grid md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />

          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="input"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="input"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>

          <button
            onClick={limpiarFiltros}
            disabled={!hayFiltros}
            className="btn btn-secondary"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {cargando && (
        <p style={{ color: "var(--bside-blue)" }}>Cargando productos...</p>
      )}

      {error && <div className="alert-error">{error}</div>}

      {!cargando && !error && productos.length === 0 && (
        <p style={{ color: "var(--bside-gray-500)" }}>
          No se encontraron productos.
        </p>
      )}

      {!cargando && !error && productos.length > 0 && (
        <div
          className="bg-white rounded-lg border overflow-hidden"
          style={{ borderColor: "#e5e5e5" }}
        >
          <table className="w-full">
            <thead style={{ backgroundColor: "#f5f5f5" }}>
              <tr>
                <Th>Producto</Th>
                <Th>Categoría</Th>
                <Th>Tipo</Th>
                <Th align="right">Precio venta</Th>
                <Th align="right">Precio costo</Th>
                <Th>Estado</Th>
                <Th align="right">Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod) => {
                const categoria = categorias.find(
                  (c) => c.id === prod.categoria_id
                );

                return (
                  <tr key={prod.id} style={{ borderTop: "1px solid #e5e5e5" }}>
                    <Td>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{prod.nombre}</span>
                        {prod.personalizable && (
                          <span
                            className="badge"
                            style={{
                              backgroundColor: "var(--bside-yellow)",
                              color: "var(--bside-black)",
                              fontSize: "0.6rem",
                              padding: "0.15rem 0.5rem",
                            }}
                          >
                            Personalizable
                          </span>
                        )}
                      </div>
                      {prod.tipo_corte && (
                        <div
                          className="text-xs uppercase"
                          style={{ color: "var(--bside-gray-500)" }}
                        >
                          {prod.tipo_corte}
                        </div>
                      )}
                    </Td>
                    <Td>{categoria?.nombre || "—"}</Td>
                    <Td>
                      <span className="badge badge-blue">{prod.tipo}</span>
                    </Td>
                    <Td align="right">
                      <span className="font-bold" style={{ color: "var(--bside-blue)" }}>
                        ${prod.precio_venta.toLocaleString("es-CO")}
                      </span>
                      {prod.en_oferta && (
                        <div className="text-xs" style={{ color: "var(--bside-orange)" }}>
                          -{prod.porcentaje_descuento}%
                        </div>
                      )}
                    </Td>
                    <Td align="right">
                      <span style={{ color: "var(--bside-gray-500)" }}>
                        ${prod.precio_costo.toLocaleString("es-CO")}
                      </span>
                    </Td>
                    <Td>
                      {prod.estado ? (
                        <span className="badge badge-blue">Activo</span>
                      ) : (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: "#e5e5e5",
                            color: "#737373",
                          }}
                        >
                          Inactivo
                        </span>
                      )}
                    </Td>
                    <Td align="right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/admin/productos/${prod.id}`}
                          className="link-primary"
                        >
                          Ver
                        </Link>
                        <Link
                          to={`/admin/productos/${prod.id}/editar`}
                          className="link-primary"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleEliminar(prod)}
                          className="text-sm"
                          style={{
                            color: "var(--bside-orange)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
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

export default AdminProductos;