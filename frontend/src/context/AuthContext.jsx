import { createContext, useEffect, useState } from "react";
import { authAPI } from "../api/endpoints";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al montar, restaurar sesión desde localStorage
  useEffect(() => {
    const tokenGuardado = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");

    if (tokenGuardado && usuarioGuardado) {
      try {
        setToken(tokenGuardado);
        setUsuario(JSON.parse(usuarioGuardado));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
      }
    }

    setCargando(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: nuevoToken, usuario: nuevoUsuario } = res.data;

    localStorage.setItem("token", nuevoToken);
    localStorage.setItem("usuario", JSON.stringify(nuevoUsuario));
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);

    return nuevoUsuario;
  };

  const registro = async (nombre, email, password) => {
    const res = await authAPI.registro({ nombre, email, password });
    return res.data.usuario;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setToken(null);
    setUsuario(null);
  };

  const esAdmin = usuario?.rol === "admin";
  const estaAutenticado = Boolean(token && usuario);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        cargando,
        login,
        registro,
        logout,
        esAdmin,
        estaAutenticado,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}