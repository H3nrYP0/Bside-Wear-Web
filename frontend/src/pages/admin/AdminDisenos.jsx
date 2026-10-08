import { useEffect, useRef, useState } from "react";
import { disenosAPI } from "../../api/endpoints";

function AdminDisenos() {
  const fileInputRef = useRef(null);

  const [disenos, setDisenos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Formulario de creación
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  // Edición
  const [editandoId, setEditandoId] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");

  const cargar = () => {
    setCargando(true);
    disenosAPI
      .adminListarTodos()
      .then((res) => setDisenos(res.data.disenos))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setArchivo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setMostrarForm(false);
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!archivo) {
      setError("Selecciona una imagen PNG o JPG");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("nombre", nombre.trim());
    if (descripcion.trim()) {
      formData.append("descripcion", descripcion.trim());
    }

    setSubiendo(true);
    try {
      await disenosAPI.crear(formData);
      resetForm();
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo crear el diseño");
    } finally {
      setSubiendo(false);
    }
  };

  const handleEditar = async (diseno) => {
    setEditandoId(diseno.id);
    setEditNombre(diseno.nombre);
    setEditDescripcion(diseno.descripcion || "");
  };

  const guardarEdicion = async () => {
    if (!editNombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    try {
      await disenosAPI.actualizar(editandoId, {
        nombre: editNombre.trim(),
        descripcion: editDescripcion.trim() || null,
      });
      setEditandoId(null);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || "No se pudo actualizar");
    }
  };

  const handleToggleEstado = async (diseno) => {
    try {
      await disenosAPI.actualizar(diseno.id, {
        estado: !diseno.estado,
      });
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || "No se pudo cambiar el estado");
    }
  };

  const handleEliminar = async (diseno) => {
    if (
      !window.confirm(
        `¿Eliminar el diseño "${diseno.nombre}"? Se eliminará también de Cloudinary.`
      )
    ) {
      return;
    }

    try {
      await disenosAPI.eliminar(diseno.id);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || "No se pudo eliminar");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "Baloo 2", color: "var(--bside-black)" }}
          >
            Diseños
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--bside-gray-500)" }}>
            Diseños disponibles para el personalizador de prendas.
          </p>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="btn btn-primary"
        >
          {mostrarForm ? "Cancelar" : "Nuevo diseño"}
        </button>
      </div>

      {/* Formulario de creación */}
      {mostrarForm && (
        <form
          onSubmit={handleCrear}
          className="bg-white rounded-lg border p-6 mb-6"
          style={{ borderColor: "#e5e5e5" }}
        >
          <h2
            className="font-bold text-lg mb-4"
            style={{ color: "var(--bside-black)" }}
          >
            Nuevo diseño
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="input"
                placeholder="Ej: Logo B-Side Negro"
              />
            </div>

            <div>
              <label className="label">Imagen (PNG o JPG)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                className="input"
                style={{ padding: "0.5rem" }}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="label">Descripción (opcional)</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="input"
              rows={2}
              style={{ resize: "none" }}
              placeholder="Breve descripción"
            />
          </div>

          {error && <div className="alert-error mb-4">{error}</div>}

          <button
            type="submit"
            disabled={subiendo}
            className="btn btn-primary"
          >
            {subiendo ? "Subiendo..." : "Crear diseño"}
          </button>
        </form>
      )}

      {/* Lista de diseños */}
      {cargando && (
        <p style={{ color: "var(--bside-blue)" }}>Cargando diseños...</p>
      )}

      {error && !mostrarForm && <div className="alert-error">{error}</div>}

      {!cargando && disenos.length === 0 && (
        <p style={{ color: "var(--bside-gray-500)" }}>
          Aún no hay diseños. Crea el primero.
        </p>
      )}

      {!cargando && disenos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {disenos.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-lg border overflow-hidden"
              style={{
                borderColor: d.estado ? "#e5e5e5" : "#f5f5f5",
                opacity: d.estado ? 1 : 0.6,
              }}
            >
              <div
                className="aspect-square flex items-center justify-center p-4"
                style={{ backgroundColor: "#f9f9f9" }}
              >
                <img
                  src={d.url}
                  alt={d.nombre}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              <div className="p-3">
                {editandoId === d.id ? (
                  <>
                    <input
                      type="text"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="input mb-2"
                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem" }}
                    />
                    <textarea
                      value={editDescripcion}
                      onChange={(e) => setEditDescripcion(e.target.value)}
                      className="input mb-2"
                      rows={2}
                      style={{
                        resize: "none",
                        padding: "0.25rem 0.5rem",
                        fontSize: "0.875rem",
                      }}
                      placeholder="Descripción"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={guardarEdicion}
                        className="btn btn-primary"
                        style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem" }}
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        className="btn btn-secondary"
                        style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem" }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-sm mb-1">{d.nombre}</p>
                    {d.descripcion && (
                      <p
                        className="text-xs mb-2 line-clamp-2"
                        style={{ color: "var(--bside-gray-500)" }}
                      >
                        {d.descripcion}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <button
                        onClick={() => handleEditar(d)}
                        className="link-primary"
                        style={{ background: "none", border: "none" }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleEstado(d)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--bside-blue)",
                        }}
                      >
                        {d.estado ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => handleEliminar(d)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--bside-orange)",
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDisenos;