import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { categoriasAPI, productosAPI } from "../../api/endpoints";

function AdminProductoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const esEdicion = Boolean(id);

  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(esEdicion);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Campos del formulario
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [tipo, setTipo] = useState("prenda");
  const [tipoCorte, setTipoCorte] = useState("regular");
  const [precioCosto, setPrecioCosto] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [enOferta, setEnOferta] = useState(false);
  const [porcentajeDescuento, setPorcentajeDescuento] = useState("");
  const [estado, setEstado] = useState(true);

  // Variantes iniciales (solo al crear)
  const [variantes, setVariantes] = useState([
    { talla: "", color: "", stock: 0 },
  ]);

  // Cargar categorías
  useEffect(() => {
    categoriasAPI
      .adminListarTodas()
      .then((res) => setCategorias(res.data.categorias.filter((c) => c.estado)))
      .catch(() => {});
  }, []);

  // Cargar producto si estamos editando
  useEffect(() => {
    if (!esEdicion) return;

    productosAPI
      .adminObtener(id)
      .then((res) => {
        const p = res.data.producto;
        setNombre(p.nombre);
        setDescripcion(p.descripcion || "");
        setCategoriaId(String(p.categoria_id));
        setTipo(p.tipo);
        setTipoCorte(p.tipo_corte || "regular");
        setPrecioCosto(String(p.precio_costo));
        setPrecioVenta(String(p.precio_venta));
        setEnOferta(p.en_oferta);
        setPorcentajeDescuento(
          p.porcentaje_descuento ? String(p.porcentaje_descuento) : ""
        );
        setEstado(p.estado);
      })
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setCargando(false));
  }, [esEdicion, id]);

  // Gestión de variantes (solo al crear)
  const agregarVariante = () => {
    setVariantes([...variantes, { talla: "", color: "", stock: 0 }]);
  };

  const eliminarVariante = (index) => {
    setVariantes(variantes.filter((_, i) => i !== index));
  };

  const actualizarVariante = (index, campo, valor) => {
    const copia = [...variantes];
    copia[index][campo] = valor;
    setVariantes(copia);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones del lado cliente
    if (!nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!categoriaId) {
      setError("Selecciona una categoría");
      return;
    }
    if (!precioCosto || !precioVenta) {
      setError("Los precios de costo y venta son obligatorios");
      return;
    }
    if (tipo === "prenda" && !tipoCorte) {
      setError("Las prendas requieren tipo de corte");
      return;
    }
    if (enOferta && !porcentajeDescuento) {
      setError("Si el producto está en oferta, indica el porcentaje");
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
      categoria_id: Number(categoriaId),
      tipo,
      tipo_corte: tipo === "prenda" ? tipoCorte : null,
      precio_costo: Number(precioCosto),
      precio_venta: Number(precioVenta),
      en_oferta: enOferta,
      porcentaje_descuento: enOferta ? Number(porcentajeDescuento) : null,
    };

    setEnviando(true);
    try {
      if (esEdicion) {
        payload.estado = estado;
        await productosAPI.actualizar(id, payload);
      } else {
        payload.variantes = variantes.map((v) => ({
          talla: v.talla.trim() || null,
          color: v.color.trim() || null,
          stock: Number(v.stock) || 0,
        }));
        await productosAPI.crear(payload);
      }
      navigate("/admin/productos");
    } catch (err) {
      const mensaje =
        err.response?.data?.error || "No se pudo guardar el producto";
      setError(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return <p style={{ color: "var(--bside-blue)" }}>Cargando producto...</p>;
  }

  return (
    <div>
      <Link to="/admin/productos" className="link-primary text-sm">
        ← Volver a productos
      </Link>

      <h1
        className="text-3xl font-bold mt-4 mb-6"
        style={{ fontFamily: "Baloo 2", color: "var(--bside-black)" }}
      >
        {esEdicion ? "Editar producto" : "Nuevo producto"}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        {/* Datos básicos */}
        <div className="bg-white rounded-lg border p-6 mb-4" style={{ borderColor: "#e5e5e5" }}>
          <h2 className="font-bold text-lg mb-4" style={{ color: "var(--bside-black)" }}>
            Datos básicos
          </h2>

          <div className="space-y-4">
            <div>
              <label className="label">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="input"
                placeholder="Ej: Camiseta Oversize Negra"
              />
            </div>

            <div>
              <label className="label">Descripción (opcional)</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="input"
                rows={3}
                style={{ resize: "none" }}
                placeholder="Breve descripción del producto"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Categoría</label>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="input"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Tipo de producto</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="input"
                >
                  <option value="prenda">Prenda</option>
                  <option value="accesorio">Accesorio</option>
                  <option value="combo">Combo</option>
                </select>
              </div>
            </div>

            {tipo === "prenda" && (
              <div>
                <label className="label">Tipo de corte</label>
                <select
                  value={tipoCorte}
                  onChange={(e) => setTipoCorte(e.target.value)}
                  className="input"
                >
                  <option value="regular">Regular</option>
                  <option value="oversize">Oversize</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Precios */}
        <div className="bg-white rounded-lg border p-6 mb-4" style={{ borderColor: "#e5e5e5" }}>
          <h2 className="font-bold text-lg mb-4" style={{ color: "var(--bside-black)" }}>
            Precios
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Precio de costo (COP)</label>
              <input
                type="number"
                value={precioCosto}
                onChange={(e) => setPrecioCosto(e.target.value)}
                className="input"
                placeholder="18000"
                min="0"
                step="100"
              />
            </div>

            <div>
              <label className="label">Precio de venta (COP)</label>
              <input
                type="number"
                value={precioVenta}
                onChange={(e) => setPrecioVenta(e.target.value)}
                className="input"
                placeholder="45000"
                min="0"
                step="100"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enOferta}
                onChange={(e) => setEnOferta(e.target.checked)}
              />
              <span className="text-sm font-medium">En oferta</span>
            </label>

            {enOferta && (
              <div className="mt-3">
                <label className="label">Porcentaje de descuento (%)</label>
                <input
                  type="number"
                  value={porcentajeDescuento}
                  onChange={(e) => setPorcentajeDescuento(e.target.value)}
                  className="input"
                  placeholder="20"
                  min="1"
                  max="99"
                />
              </div>
            )}
          </div>
        </div>

        {/* Variantes (solo al crear) */}
        {!esEdicion && (
          <div className="bg-white rounded-lg border p-6 mb-4" style={{ borderColor: "#e5e5e5" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg" style={{ color: "var(--bside-black)" }}>
                Variantes iniciales
              </h2>
              <button
                type="button"
                onClick={agregarVariante}
                className="btn btn-secondary"
                style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
              >
                + Agregar variante
              </button>
            </div>

            <p className="text-sm mb-4" style={{ color: "var(--bside-gray-500)" }}>
              Puedes dejar talla y color vacíos para accesorios. Necesitas al
              menos una variante.
            </p>

            <div className="space-y-3">
              {variantes.map((v, i) => (
                <div
                  key={i}
                  className="grid gap-3 items-end"
                  style={{ gridTemplateColumns: "1fr 1fr 100px auto" }}
                >
                  <div>
                    <label className="label text-xs">Talla</label>
                    <input
                      type="text"
                      value={v.talla}
                      onChange={(e) => actualizarVariante(i, "talla", e.target.value)}
                      className="input"
                      placeholder="S, M, L..."
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Color</label>
                    <input
                      type="text"
                      value={v.color}
                      onChange={(e) => actualizarVariante(i, "color", e.target.value)}
                      className="input"
                      placeholder="Negro, Blanco..."
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Stock</label>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => actualizarVariante(i, "stock", e.target.value)}
                      className="input"
                      min="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarVariante(i)}
                    disabled={variantes.length === 1}
                    className="text-sm"
                    style={{
                      color:
                        variantes.length === 1
                          ? "#ccc"
                          : "var(--bside-orange)",
                      background: "none",
                      border: "none",
                      cursor: variantes.length === 1 ? "not-allowed" : "pointer",
                      paddingBottom: "0.75rem",
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado (solo en edición) */}
        {esEdicion && (
          <div className="bg-white rounded-lg border p-6 mb-4" style={{ borderColor: "#e5e5e5" }}>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={estado}
                onChange={(e) => setEstado(e.target.checked)}
              />
              <span className="text-sm font-medium">Producto activo</span>
            </label>
          </div>
        )}

        {error && <div className="alert-error mb-4">{error}</div>}

        <div className="flex gap-3">
          <Link
            to="/admin/productos"
            className="btn btn-secondary"
            style={{ flex: 1, textAlign: "center" }}
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={enviando}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            {enviando
              ? "Guardando..."
              : esEdicion
              ? "Guardar cambios"
              : "Crear producto"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminProductoForm;