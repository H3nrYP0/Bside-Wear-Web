import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  productosAPI,
  variantesAPI,
  imagenesAPI,
} from "../../api/endpoints";

function AdminProductoDetalle() {
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const [producto, setProducto] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [imagenes, setImagenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const cargar = () => {
    setCargando(true);
    Promise.all([
      productosAPI.adminObtener(id),
      variantesAPI.adminListarDeProducto(id),
      imagenesAPI.listarDeProducto(id),
    ])
      .then(([resProd, resVar, resImg]) => {
        setProducto(resProd.data.producto);
        setVariantes(resVar.data.variantes);
        setImagenes(resImg.data.imagenes);
      })
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubirImagen = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendo(true);
    setError(null);

    const formData = new FormData();
    formData.append("archivo", file);

    try {
      await imagenesAPI.subir(id, formData);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo subir la imagen");
    } finally {
      setSubiendo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleEliminarImagen = async (imagenId) => {
    if (!window.confirm("¿Eliminar esta imagen?")) return;
    try {
      await imagenesAPI.eliminar(imagenId);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || "No se pudo eliminar la imagen");
    }
  };

  const handleCambiarStock = async (varianteId, nuevoStock) => {
    try {
      await variantesAPI.actualizar(varianteId, { stock: nuevoStock });
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || "No se pudo actualizar el stock");
    }
  };

  if (cargando) {
    return <p style={{ color: "var(--bside-blue)" }}>Cargando producto...</p>;
  }

  if (error && !producto) {
    return <div className="alert-error">{error}</div>;
  }

  return (
    <div>
      <Link to="/admin/productos" className="link-primary text-sm">
        ← Volver a productos
      </Link>

      <div className="flex items-center justify-between mt-4 mb-6">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "Baloo 2", color: "var(--bside-black)" }}
        >
          {producto.nombre}
        </h1>
        <Link
          to={`/admin/productos/${id}/editar`}
          className="btn btn-secondary"
        >
          Editar datos
        </Link>
      </div>

      {/* Info básica */}
      <div className="bg-white rounded-lg border p-6 mb-4" style={{ borderColor: "#e5e5e5" }}>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p style={{ color: "var(--bside-gray-500)" }}>Tipo</p>
            <p className="font-medium">{producto.tipo}</p>
          </div>
          {producto.tipo_corte && (
            <div>
              <p style={{ color: "var(--bside-gray-500)" }}>Corte</p>
              <p className="font-medium">{producto.tipo_corte}</p>
            </div>
          )}
          <div>
            <p style={{ color: "var(--bside-gray-500)" }}>Estado</p>
            <p className="font-medium">
              {producto.estado ? "Activo" : "Inactivo"}
            </p>
          </div>
          <div>
            <p style={{ color: "var(--bside-gray-500)" }}>Personalizable</p>
            <p className="font-medium">
              {producto.personalizable ? "Sí" : "No"}
            </p>
          </div>
          <div>
            <p style={{ color: "var(--bside-gray-500)" }}>Precio costo</p>
            <p className="font-medium">
              ${producto.precio_costo.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p style={{ color: "var(--bside-gray-500)" }}>Precio venta</p>
            <p className="font-medium" style={{ color: "var(--bside-blue)" }}>
              ${producto.precio_venta.toLocaleString("es-CO")}
            </p>
          </div>
          {producto.en_oferta && (
            <div>
              <p style={{ color: "var(--bside-gray-500)" }}>Descuento</p>
              <p className="font-medium" style={{ color: "var(--bside-orange)" }}>
                -{producto.porcentaje_descuento}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Imágenes */}
      <div className="bg-white rounded-lg border p-6 mb-4" style={{ borderColor: "#e5e5e5" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg" style={{ color: "var(--bside-black)" }}>
            Imágenes
          </h2>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleSubirImagen}
              style={{ display: "none" }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={subiendo}
              className="btn btn-primary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
            >
              {subiendo ? "Subiendo..." : "Subir imagen"}
            </button>
          </div>
        </div>

        {error && <div className="alert-error mb-4">{error}</div>}

        {imagenes.length === 0 ? (
          <p style={{ color: "var(--bside-gray-500)" }}>
            Este producto aún no tiene imágenes.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {imagenes.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square rounded-lg overflow-hidden border"
                style={{ borderColor: "#e5e5e5" }}
              >
                <img
                  src={img.url}
                  alt={`Imagen ${img.id}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleEliminarImagen(img.id)}
                  className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded"
                  style={{ backgroundColor: "var(--bside-orange)" }}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variantes */}
      <div className="bg-white rounded-lg border p-6" style={{ borderColor: "#e5e5e5" }}>
        <h2 className="font-bold text-lg mb-4" style={{ color: "var(--bside-black)" }}>
          Variantes y stock
        </h2>

        {variantes.length === 0 ? (
          <p style={{ color: "var(--bside-gray-500)" }}>
            Este producto no tiene variantes.
          </p>
        ) : (
          <div className="space-y-2">
            {variantes.map((v) => (
              <FilaVariante
                key={v.id}
                variante={v}
                onCambiarStock={handleCambiarStock}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilaVariante({ variante, onCambiarStock }) {
  const [stock, setStock] = useState(variante.stock);
  const [guardando, setGuardando] = useState(false);

  const etiqueta =
    [variante.talla, variante.color].filter(Boolean).join(" / ") || "Única";

  const guardar = async () => {
    if (stock === variante.stock) return;
    setGuardando(true);
    await onCambiarStock(variante.id, Number(stock));
    setGuardando(false);
  };

  return (
    <div
      className="flex items-center justify-between py-2 px-3 rounded"
      style={{ backgroundColor: "#fafafa" }}
    >
      <div className="flex items-center gap-3">
        <span className="font-medium text-sm">{etiqueta}</span>
        {!variante.estado && (
          <span
            className="badge"
            style={{ backgroundColor: "#e5e5e5", color: "#737373" }}
          >
            Inactiva
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm" style={{ color: "var(--bside-gray-500)" }}>
          Stock:
        </label>
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          min="0"
          className="input"
          style={{ width: "80px", padding: "0.25rem 0.5rem" }}
        />
        <button
          onClick={guardar}
          disabled={guardando || Number(stock) === variante.stock}
          className="btn btn-primary"
          style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem" }}
        >
          {guardando ? "..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}

export default AdminProductoDetalle;