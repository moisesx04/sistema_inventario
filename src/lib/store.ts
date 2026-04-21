import { create } from "zustand";

interface Product {
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
}

export const useInventoryStore = create<InventoryState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  categoryFilter: "",
  setCategoryFilter: (cat) => set({ categoryFilter: cat }),
  isAddModalOpen: false,
  setIsAddModalOpen: (open) => set({ isAddModalOpen: open }),
  editingProduct: null,
  setEditingProduct: (product) => set({ editingProduct: product }),
}));
