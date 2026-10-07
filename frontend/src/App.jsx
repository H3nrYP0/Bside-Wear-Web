import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";
import Personalizador from "./pages/Personalizador";
import Carrito from "./pages/Carrito";
import Login from "./pages/Login";
import NoEncontrada from "./pages/NoEncontrada";
import ProductoDetalle from "./pages/ProductoDetalle";
import Registro from "./pages/Registro";
import Checkout from "./pages/Checkout";
import MisPedidos from "./pages/MisPedidos";
import RutaProtegida from "./components/RutaProtegida";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/catalogo/:id" element={<ProductoDetalle />} />
          <Route path="/personalizar" element={<Personalizador />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/mis-pedidos/:id" element={
            <RutaProtegida>
              <MisPedidos />
            </RutaProtegida>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="*" element={<NoEncontrada />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;