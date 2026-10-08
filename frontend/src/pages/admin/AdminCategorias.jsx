import { useEffect, useState } from "react";
import { categoriasAPI } from "../../api/endpoints";

function AdminCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);

  const cargar = () => {
    setCargando(true);
    categoriasAPI
      .adminListarTodas()
      .then((res) => setCategorias(res.data.categorias))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirCrear = () => {
    setCategoriaEditando(null);
    setModalAbierto(true);
  };

  const abrirEditar = (categoria) => {
    setCategoriaEditando(categoria);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCategoriaEditando(null);
  };

  const handleGuardado = () => {
    cerrarModal();
    cargar();
  };

  const handleEliminar = async (categoria) => {
    if (
      !window.confirm(
        `¿Eliminar la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await categoriasAPI.eliminar(categoria.id);
      cargar();
    } catch (err) {
      const mensaje = err.response?.data?.error || "No se pudo eliminar";
      alert(mensaje);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "Baloo 2", color: "var(--bside-black)" }}
        >
          Categorías
        </h1>
        <button onClick={abrirCrear} className="btn btn-primary">
          Nueva categoría
        </button>
      </div>

      {cargando && (
        <p style={{ color: "var(--bside-blue)" }}>Cargando categorías...</p>
      )}

      {error && <div className="alert-error">{error}</div>}

      {!cargando && !error && categorias.length === 0 && (
        <p style={{ color: "var(--bside-gray-500)" }}>
          Aún no hay categorías. Crea la primera.
        </p>
      )}

      {!cargando && !error && categorias.length > 0 && (
        <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: "#e5e5e5" }}>
          <table className="w-full">
            <thead style={{ backgroundColor: "#f5f5f5" }}>
              <tr>
                <Th>Nombre</Th>
                <Th>Descripción</Th>
                <Th>Estado</Th>
                <Th align="right">Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat) => (
                <tr key={cat.id} style={{ borderTop: "1px solid #e5e5e5" }}>
                  <Td>{cat.nombre}</Td>
                  <Td>
                    <span style={{ color: "var(--bside-gray-500)" }}>
                      {cat.descripcion || "—"}
                    </span>
                  </Td>
                  <Td>
                    {cat.estado ? (
                      <span className="badge badge-blue">Activa</span>
                    ) : (
                      <span
                        className="badge"
                        style={{ backgroundColor: "#e5e5e5", color: "#737373" }}
                      >
                        Inactiva
                      </span>
                    )}
                  </Td>
                  <Td align="right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => abrirEditar(cat)}
                        className="link-primary"
                        style={{ background: "none", border: "none" }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(cat)}
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <ModalCategoria
          categoria={categoriaEditando}
          onClose={cerrarModal}
          onGuardado={handleGuardado}
        />
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

function ModalCategoria({ categoria, onClose, onGuardado }) {
  const esEdicion = Boolean(categoria);

  const [nombre, setNombre] = useState(categoria?.nombre || "");
  const [descripcion, setDescripcion] = useState(categoria?.descripcion || "");
  const [estado, setEstado] = useState(categoria?.estado ?? true);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    setEnviando(true);
    try {
      if (esEdicion) {
        await categoriasAPI.actualizar(categoria.id, {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          estado,
        });
      } else {
        await categoriasAPI.crear({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
        });
      }
      onGuardado();
    } catch (err) {
      const mensaje =
        err.response?.data?.error || "No se pudo guardar la categoría";
      setError(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: "Baloo 2", color: "var(--bside-black)" }}
        >
          {esEdicion ? "Editar categoría" : "Nueva categoría"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input"
              placeholder="Ej: Camisetas"
              autoFocus
            />
          </div>

          <div>
            <label className="label">Descripción (opcional)</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="input"
              rows={3}
              placeholder="Breve descripción"
              style={{ resize: "none" }}
            />
          </div>

          {esEdicion && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="estado"
                checked={estado}
                onChange={(e) => setEstado(e.target.checked)}
              />
              <label htmlFor="estado" className="text-sm">
                Categoría activa
              </label>
            </div>
          )}

          {error && <div className="alert-error">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {enviando ? "Guardando..." : esEdicion ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminCategorias;