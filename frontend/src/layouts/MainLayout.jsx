import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCarritoStore } from "../store/carritoStore";
import Logo from "../components/Logo";

function MainLayout() {
  const { estaAutenticado, usuario, logout } = useAuth();
  const navigate = useNavigate();
  const totalItems = useCarritoStore((s) => s.totalItems());

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header
        className="sticky top-0 bg-white z-50 border-b-2"
        style={{ borderColor: "var(--bside-black)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" style={{ color: "var(--bside-blue)" }}>
            <Logo size={36} />
          </Link>

          <nav className="hidden md:flex items-center gap-6 font-medium">
            <NavItem to="/">Inicio</NavItem>
            <NavItem to="/catalogo">Catálogo</NavItem>
            <NavItem to="/personalizar">Personalizar</NavItem>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/carrito"
              className="relative px-3 py-2 font-medium link-primary"
            >
              Carrito
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ backgroundColor: "var(--bside-orange)" }}
                >
                  {totalItems}
                </span>
              )}
            </Link>

            {estaAutenticado ? (
              <div className="flex items-center gap-3">
                <span
                  className="hidden md:inline text-sm font-medium"
                  style={{ color: "var(--bside-black)" }}
                >
                  {usuario?.nombre}
                </span>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Salir
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer
        className="text-white"
        style={{ backgroundColor: "var(--bside-black)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
          <div>
            <div className="mb-3" style={{ color: "var(--bside-yellow)" }}>
              <Logo size={32} />
            </div>
            <p className="text-sm" style={{ color: "#d4d4d4" }}>
              Fuera de la cuadrícula. Streetwear con identidad propia desde Medellín.
            </p>
          </div>

          <div>
            <h3
              className="font-bold mb-3"
              style={{ color: "var(--bside-yellow)" }}
            >
              Navegación
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/catalogo" className="hover:opacity-80 transition">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link to="/personalizar" className="hover:opacity-80 transition">
                  Personalizar
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:opacity-80 transition">
                  Ingresar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3
              className="font-bold mb-3"
              style={{ color: "var(--bside-yellow)" }}
            >
              Contacto
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: "#d4d4d4" }}>
              <li>bsidefueradelacuadricula@gmail.com</li>
              <li>@bside_wear</li>
              <li>Belén Rincón, Medellín</li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #404040" }}>
          <div
            className="max-w-7xl mx-auto px-4 py-4 text-center text-xs"
            style={{ color: "#a3a3a3" }}
          >
            © 2026 B-Side Wear. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `transition ${isActive ? "link-primary" : ""}`
      }
      style={({ isActive }) => ({
        color: isActive ? "var(--bside-blue)" : "var(--bside-black)",
      })}
    >
      {children}
    </NavLink>
  );
}

export default MainLayout;