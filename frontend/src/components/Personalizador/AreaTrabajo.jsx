import { useEffect, useRef, useState } from "react";

const CORREO_BSIDE = "bsidefueradelacuadricula@gmail.com";

function AreaTrabajo({ prenda, diseno, onVolver }) {
  const canvasRef = useRef(null);
  const [cargado, setCargado] = useState(false);

  // Transformaciones del diseño
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [escala, setEscala] = useState(30);
  const [rotacion, setRotacion] = useState(0);

  // Estado del arrastre
  const [arrastrando, setArrastrando] = useState(false);
  const [inicio, setInicio] = useState({ x: 0, y: 0 });

  // Datos del envío
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState("");
  const [generando, setGenerando] = useState(false);

  // Imágenes cargadas
  const imgFondoRef = useRef(null);
  const imgDisenoRef = useRef(null);

  const TAMANO_CANVAS = 500;

  // Cargar imágenes
  useEffect(() => {
    const imgFondo = new Image();
    imgFondo.crossOrigin = "anonymous";
    imgFondo.src = prenda.imagen_principal;
    imgFondo.onload = () => {
      imgFondoRef.current = imgFondo;
      verificarCarga();
    };

    const imgDiseno = new Image();
    imgDiseno.crossOrigin = "anonymous";
    imgDiseno.src = diseno.url;
    imgDiseno.onload = () => {
      imgDisenoRef.current = imgDiseno;
      verificarCarga();
    };

    const verificarCarga = () => {
      if (imgFondoRef.current && imgDisenoRef.current) {
        setCargado(true);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redibujar cuando cambian las transformaciones
  useEffect(() => {
    if (!cargado) return;
    dibujar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargado, posX, posY, escala, rotacion]);

  const dibujar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, TAMANO_CANVAS, TAMANO_CANVAS);

    // Fondo: imagen de la prenda ajustada al canvas
    ctx.drawImage(imgFondoRef.current, 0, 0, TAMANO_CANVAS, TAMANO_CANVAS);

    // Diseño con transformaciones
    const img = imgDisenoRef.current;
    if (!img) return;

    // Tamaño escalado
    const anchoBase = TAMANO_CANVAS * 0.5; // 50% del canvas
    const factor = escala / 50; // 50 = escala por defecto
    const ancho = anchoBase * factor;
    const alto = (img.height / img.width) * ancho;

    // Posición en el canvas
    const x = (posX / 100) * TAMANO_CANVAS;
    const y = (posY / 100) * TAMANO_CANVAS;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotacion * Math.PI) / 180);
    ctx.drawImage(img, -ancho / 2, -alto / 2, ancho, alto);
    ctx.restore();
  };

  // ==== Mouse / Touch ====

  const obtenerPosicion = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clienteX = e.touches ? e.touches[0].clientX : e.clientX;
    const clienteY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clienteX - rect.left) / rect.width) * 100,
      y: ((clienteY - rect.top) / rect.height) * 100,
    };
  };

  const handleInicio = (e) => {
    e.preventDefault();
    setArrastrando(true);
    setInicio({ x: posX, y: posY });
  };

  const handleMover = (e) => {
    if (!arrastrando) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clienteX = e.touches ? e.touches[0].clientX : e.clientX;
    const clienteY = e.touches ? e.touches[0].clientY : e.clientY;

    // Calcular delta desde el inicio
    const deltaX = ((clienteX - rect.left) / rect.width) * 100 - posX;
    const deltaY = ((clienteY - rect.top) / rect.height) * 100 - posY;

    // Aplicar movimiento (limitado a 0-100)
    setPosX(Math.max(5, Math.min(95, posX + deltaX)));
    setPosY(Math.max(5, Math.min(95, posY + deltaY)));
  };

  const handleFin = () => {
    setArrastrando(false);
  };

  // ==== Generar imagen final ====

  const generarImagen = () => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve(null);

      canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
    });
  };

  const descargarBlob = (blob, nombre) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEnviar = async () => {
    setGenerando(true);

    try {
      const blob = await generarImagen();
      if (!blob) {
        alert("No se pudo generar la imagen. Intenta de nuevo.");
        return;
      }

      const nombreArchivo = `personalizacion-${prenda.nombre
        .toLowerCase()
        .replace(/\s+/g, "-")}-${Date.now()}.png`;

      // 1. Descargar la imagen
      descargarBlob(blob, nombreArchivo);

      // 2. Abrir el correo con el mensaje prearmado
      const asunto = `Solicitud de personalización - ${prenda.nombre}`;
      const cuerpo = [
        "Hola B-Side, quiero personalizar una prenda.",
        "",
        `Producto: ${prenda.nombre}`,
        `Diseño: ${diseno.nombre}`,
        `Cantidad: ${cantidad}`,
        notas.trim() ? `Notas: ${notas.trim()}` : "",
        "",
        "Adjunto la imagen con mi personalización.",
        "",
        "Gracias.",
      ]
        .filter(Boolean)
        .join("\n");

      const mailto = `mailto:${CORREO_BSIDE}?subject=${encodeURIComponent(
        asunto
      )}&body=${encodeURIComponent(cuerpo)}`;

      window.location.href = mailto;
    } catch {
      alert("Ocurrió un error al generar la imagen.");
    } finally {
      setGenerando(false);
    }
  };

  if (!cargado) {
    return (
      <div className="text-center py-16">
        <p style={{ color: "var(--bside-blue)" }}>Cargando imágenes...</p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onVolver}
        className="link-primary text-sm mb-4"
        style={{ background: "none", border: "none" }}
      >
        ← Cambiar diseño
      </button>

      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        {/* Canvas */}
        <div>
          <div
            className="rounded-lg overflow-hidden border-2 mx-auto"
            style={{ borderColor: "#e5e5e5", maxWidth: "500px" }}
          >
            <canvas
              ref={canvasRef}
              width={TAMANO_CANVAS}
              height={TAMANO_CANVAS}
              onMouseDown={handleInicio}
              onMouseMove={handleMover}
              onMouseUp={handleFin}
              onMouseLeave={handleFin}
              onTouchStart={handleInicio}
              onTouchMove={handleMover}
              onTouchEnd={handleFin}
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                cursor: arrastrando ? "grabbing" : "grab",
                touchAction: "none",
              }}
            />
          </div>
          <p
            className="text-center text-sm mt-3"
            style={{ color: "var(--bside-gray-500)" }}
          >
            Arrastra el diseño para moverlo. Usa los controles para
            ajustarlo.
          </p>
        </div>

        {/* Controles */}
        <div className="space-y-6">
          <div>
            <label className="label">Tamaño</label>
            <input
              type="range"
              min="10"
              max="100"
              value={escala}
              onChange={(e) => setEscala(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="label">Rotación ({rotacion}°)</label>
            <input
              type="range"
              min="-180"
              max="180"
              value={rotacion}
              onChange={(e) => setRotacion(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={() => {
              setPosX(50);
              setPosY(50);
              setEscala(30);
              setRotacion(0);
            }}
            className="btn btn-secondary btn-full"
            style={{ padding: "0.5rem" }}
          >
            Reiniciar posición
          </button>

          <hr style={{ borderColor: "#e5e5e5" }} />

          <div>
            <label className="label">Cantidad</label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
              min="1"
              className="input"
            />
          </div>

          <div>
            <label className="label">Notas (opcional)</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="input"
              rows={3}
              style={{ resize: "none" }}
              placeholder="Indicaciones especiales para B-Side"
            />
          </div>

          <button
            onClick={handleEnviar}
            disabled={generando}
            className="btn btn-primary btn-full"
          >
            {generando ? "Generando..." : "Generar y enviar"}
          </button>

          <p
            className="text-xs"
            style={{ color: "var(--bside-gray-500)", textAlign: "center" }}
          >
            Se descargará tu diseño y se abrirá tu correo. Adjunta la imagen
            antes de enviar.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AreaTrabajo;