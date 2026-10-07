import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCarritoStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Agregar un ítem (o sumar cantidad si ya existe)
      agregar: (nuevoItem) => {
        const { items } = get();
        const idx = items.findIndex(
          (i) => i.variante_id === nuevoItem.variante_id
        );

        if (idx >= 0) {
          const actualizado = [...items];
          const cantidadTotal = actualizado[idx].cantidad + nuevoItem.cantidad;
          // No superar el stock
          actualizado[idx].cantidad = Math.min(
            cantidadTotal,
            nuevoItem.stock_disponible
          );
          set({ items: actualizado });
        } else {
          set({ items: [...items, nuevoItem] });
        }
      },

      // Cambiar la cantidad de un ítem
      cambiarCantidad: (varianteId, nuevaCantidad) => {
        const { items } = get();
        const actualizado = items.map((i) =>
          i.variante_id === varianteId
            ? {
                ...i,
                cantidad: Math.max(
                  1,
                  Math.min(nuevaCantidad, i.stock_disponible)
                ),
              }
            : i
        );
        set({ items: actualizado });
      },

      // Eliminar un ítem
      eliminar: (varianteId) => {
        const { items } = get();
        set({ items: items.filter((i) => i.variante_id !== varianteId) });
      },

      // Vaciar el carrito
      vaciar: () => set({ items: [] }),

      // Total de ítems (sumando cantidades)
      totalItems: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),

      // Total en dinero
      totalPrecio: () =>
        get().items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0),
    }),
    {
      name: "bside-carrito",
    }
  )
);