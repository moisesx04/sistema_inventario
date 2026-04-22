import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  sku: string;
  createdAt: string;
  updatedAt: string;
}

interface InventoryState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;
  // Local Persistence State
  isLocalMode: boolean;
  toggleLocalMode: () => void;
  localProducts: Product[];
  setLocalProducts: (products: Product[]) => void;
  addLocalProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
  updateLocalProduct: (id: string, product: Partial<Product>) => void;
  deleteLocalProduct: (id: string) => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
      categoryFilter: "",
      setCategoryFilter: (cat) => set({ categoryFilter: cat }),
      isAddModalOpen: false,
      setIsAddModalOpen: (open) => set({ isAddModalOpen: open }),
      editingProduct: null,
      setEditingProduct: (product) => set({ editingProduct: product }),
      
      // Local Persistence Implementation
      isLocalMode: false,
      toggleLocalMode: () => set((state) => ({ isLocalMode: !state.isLocalMode })),
      localProducts: [],
      setLocalProducts: (products) => set({ localProducts: products }),
      
      addLocalProduct: (data) => set((state) => {
        const newProduct: Product = {
          ...data,
          id: `local-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { localProducts: [newProduct, ...state.localProducts] };
      }),
      
      updateLocalProduct: (id, data) => set((state) => ({
        localProducts: state.localProducts.map((p) => 
          p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
        )
      })),
      
      deleteLocalProduct: (id) => set((state) => ({
        localProducts: state.localProducts.filter((p) => p.id !== id)
      })),
    }),
    {
      name: "inventory-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({
        localProducts: state.localProducts,
        isLocalMode: state.isLocalMode,
      }),
    }
  )
);
