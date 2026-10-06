import client from "./client";

// ===== Auth =====
export const authAPI = {
  registro: (data) => client.post("/auth/registro", data),
  login: (data) => client.post("/auth/login", data),
  perfil: () => client.get("/auth/perfil"),
};

// ===== Categorías =====
export const categoriasAPI = {
  listar: () => client.get("/categorias/"),
  obtener: (id) => client.get(`/categorias/${id}`),
  adminListarTodas: () => client.get("/categorias/admin/todas"),
  crear: (data) => client.post("/categorias/", data),
  actualizar: (id, data) => client.put(`/categorias/${id}`, data),
  eliminar: (id) => client.delete(`/categorias/${id}`),
};

// ===== Productos =====
export const productosAPI = {
  listar: (params) => client.get("/productos/", { params }),
  obtener: (id) => client.get(`/productos/${id}`),
  adminListarTodos: (params) => client.get("/productos/admin/todos", { params }),
  adminObtener: (id) => client.get(`/productos/admin/${id}`),
  crear: (data) => client.post("/productos/", data),
  actualizar: (id, data) => client.put(`/productos/${id}`, data),
  eliminar: (id) => client.delete(`/productos/${id}`),
};

// ===== Variantes =====
export const variantesAPI = {
  listarDeProducto: (productoId) =>
    client.get(`/variantes/producto/${productoId}`),
  adminListarDeProducto: (productoId) =>
    client.get(`/variantes/producto/${productoId}/admin`),
  crear: (productoId, data) =>
    client.post(`/variantes/producto/${productoId}`, data),
  actualizar: (id, data) => client.put(`/variantes/${id}`, data),
  eliminar: (id) => client.delete(`/variantes/${id}`),
};

// ===== Imágenes =====
export const imagenesAPI = {
  listarDeProducto: (productoId) =>
    client.get(`/imagenes/producto/${productoId}`),
  subir: (productoId, formData) =>
    client.post(`/imagenes/producto/${productoId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  actualizarOrden: (id, orden) =>
    client.put(`/imagenes/${id}/orden`, { orden }),
  eliminar: (id) => client.delete(`/imagenes/${id}`),
};

// ===== Diseños =====
export const disenosAPI = {
  listar: (params) => client.get("/disenos/", { params }),
  obtener: (id) => client.get(`/disenos/${id}`),
  adminListarTodos: (params) => client.get("/disenos/admin/todos", { params }),
  crear: (formData) =>
    client.post("/disenos/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  actualizar: (id, data) => client.put(`/disenos/${id}`, data),
  eliminar: (id) => client.delete(`/disenos/${id}`),
};

// ===== Pedidos =====
export const pedidosAPI = {
  crear: (data) => client.post("/pedidos/", data),
  misPedidos: () => client.get("/pedidos/mis-pedidos"),
  miPedido: (id) => client.get(`/pedidos/mis-pedidos/${id}`),
  adminListarTodos: (params) => client.get("/pedidos/admin/todos", { params }),
  adminObtener: (id) => client.get(`/pedidos/admin/${id}`),
  adminCambiarEstado: (id, estado) =>
    client.put(`/pedidos/admin/${id}/estado`, { estado }),
};

// ===== Dashboard =====
export const dashboardAPI = {
  resumen: () => client.get("/dashboard/resumen"),
};