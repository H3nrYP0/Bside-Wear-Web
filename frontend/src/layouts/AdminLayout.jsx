import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AdminSidebar from "../components/AdminSidebar";

function AdminLayout() {
  const { usuario } = useAuth();

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#f5f5f5" }}>
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <header
          className="bg-white border-b px-6 py-3 flex items-center justify-between"
          style={{ borderColor: "#e5e5e5" }}
        >
          <p className="text-sm" style={{ color: "var(--bside-gray-500)" }}>
            Panel de administración
          </p>

          <div className="flex items-center gap-4">
            <span
              className="text-sm font-medium"
              style={{ color: "var(--bside-black)" }}
            >
              {usuario?.nombre}
            </span>
            <Link to="/" className="text-sm link-primary">
              Ver tienda
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;