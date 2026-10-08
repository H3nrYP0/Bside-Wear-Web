import { NavLink } from "react-router-dom";

function AdminSidebar() {
  return (
    <aside
      className="w-60 flex-shrink-0 min-h-screen p-4"
      style={{ backgroundColor: "var(--bside-black)" }}
    >
      <h2
        className="text-xl font-bold mb-8 px-3"
        style={{
          fontFamily: "Baloo 2",
          color: "var(--bside-yellow)",
        }}
      >
        Admin
      </h2>

      <nav className="space-y-1">
        <SidebarItem to="/admin" end>
          Dashboard
        </SidebarItem>
        <SidebarItem to="/admin/productos">Productos</SidebarItem>
        <SidebarItem to="/admin/categorias">Categorías</SidebarItem>
        <SidebarItem to="/admin/pedidos">Pedidos</SidebarItem>
        <SidebarItem to="/admin/disenos">Diseños</SidebarItem>
      </nav>
    </aside>
  );
}

function SidebarItem({ to, children, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className="block px-3 py-2 rounded-lg transition text-sm"
      style={({ isActive }) => ({
        backgroundColor: isActive ? "var(--bside-yellow)" : "transparent",
        color: isActive ? "var(--bside-black)" : "white",
        fontWeight: isActive ? "700" : "500",
      })}
    >
      {children}
    </NavLink>
  );
}

export default AdminSidebar;