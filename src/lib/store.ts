import { create } from "zustand";
import { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => {
    const items = get().items;
    const existing = items.find((i) => i.product_id === item.product_id);
    if (existing) {
      set({
        items: items.map((i) =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        ),
      });
    } else {
      set({ items: [...items, item] });
    }
    get().saveToStorage();
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.product_id !== productId) });
    get().saveToStorage();
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.product_id === productId ? { ...i, quantity } : i
      ),
    });
    get().saveToStorage();
  },

  clearCart: () => {
    set({ items: [] });
    if (typeof window !== "undefined") {
      localStorage.removeItem("nox-cart");
    }
  },

  getTotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },

  loadFromStorage: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("nox-cart");
      if (stored) {
        try {
          set({ items: JSON.parse(stored) });
        } catch {
          localStorage.removeItem("nox-cart");
        }
      }
    }
  },

  saveToStorage: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nox-cart", JSON.stringify(get().items));
    }
  },
}));
