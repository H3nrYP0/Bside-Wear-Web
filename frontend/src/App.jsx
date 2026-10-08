import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";
import Personalizador from "./pages/Personalizador";
import Carrito from "./pages/Carrito";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import NoEncontrada from "./pages/NoEncontrada";
import ProductoDetalle from "./pages/ProductoDetalle";
import Checkout from "./pages/Checkout";
import MisPedidos from "./pages/MisPedidos";
import RutaProtegida from "./components/RutaProtegida";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategorias from "./pages/admin/AdminCategorias";
import AdminProductos from "./pages/admin/AdminProductos";
import AdminPedidos from "./pages/admin/AdminPedidos";
import AdminDisenos from "./pages/admin/AdminDisenos";
import AdminProductoForm from "./pages/admin/AdminProductoForm";
import AdminProductoDetalle from "./pages/admin/AdminProductoDetalle";
import AdminPedidoDetalle from "./pages/admin/AdminPedidoDetalle";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas con MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/catalogo/:id" element={<ProductoDetalle />} />
          <Route path="/personalizar" element={<Personalizador />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/mis-pedidos/:id"
            element={
              <RutaProtegida>
                <MisPedidos />
              </RutaProtegida>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="*" element={<NoEncontrada />} />
        </Route>

        {/* Rutas admin con AdminLayout */}
        <Route
          path="/admin"
          element={
            <RutaProtegida soloAdmin>
              <AdminLayout />
            </RutaProtegida>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="categorias" element={<AdminCategorias />} />
          <Route path="productos" element={<AdminProductos />} />
          <Route path="productos/nuevo" element={<AdminProductoForm />} />
          <Route path="productos/:id" element={<AdminProductoDetalle />} />
          <Route path="productos/:id/editar" element={<AdminProductoForm />} />
          <Route path="pedidos" element={<AdminPedidos />} />
          <Route path="pedidos/:id" element={<AdminPedidoDetalle />} />
          <Route path="disenos" element={<AdminDisenos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;