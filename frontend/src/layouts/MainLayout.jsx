import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Logo from "../components/Logo";

function MainLayout() {
  const { estaAutenticado, usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b-2 border-bside-black sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-bside-blue hover:opacity-80 transition">
            <Logo size={36} />
          </Link>

          {/* Navegación */}
          <nav className="hidden md:flex items-center gap-6 font-medium">
            <NavItem to="/">Inicio</NavItem>
            <NavItem to="/catalogo">Catálogo</NavItem>
            <NavItem to="/personalizar">Personalizar</NavItem>
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            <Link
              to="/carrito"
              className="px-3 py-2 font-medium hover:text-bside-blue transition"
            >
              Carrito
            </Link>
            {estaAutenticado ? (
              <div className="flex items-center gap-3">
                <span className="hidden md:inline text-sm font-medium text-bside-black">
                  {usuario?.nombre}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border-2 border-bside-black text-bside-black font-semibold rounded-full hover:bg-bside-black hover:text-white transition"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-bside-blue text-white font-semibold rounded-full hover:bg-bside-orange transition"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Contenido de cada página */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-bside-black bg-bside-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
          <div>
            <div className="mb-3">
              <Logo size={32} className="text-bside-yellow" />
            </div>
            <p className="text-sm text-gray-300">
              Fuera de la cuadrícula. Streetwear con identidad propia desde Medellín.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3 text-bside-yellow">Navegación</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/catalogo" className="hover:text-bside-yellow transition">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link to="/personalizar" className="hover:text-bside-yellow transition">
                  Personalizar
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-bside-yellow transition">
                  Ingresar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3 text-bside-yellow">Contacto</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>bsidefueradelacuadricula@gmail.com</li>
              <li>@bside_wear</li>
              <li>Belén Rincón, Medellín</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-gray-400">
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
        `transition ${
          isActive ? "text-bside-blue" : "text-bside-black hover:text-bside-blue"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default MainLayout;