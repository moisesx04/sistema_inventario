"use client";

import { ProductList } from "@/components/inventory/product-list";
import { ProductForm } from "@/components/inventory/product-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, X } from "lucide-react";
import { useInventoryStore } from "@/lib/store";

export default function InventoryPage() {
  const { searchQuery, setSearchQuery, setIsAddModalOpen } = useInventoryStore();

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Inventario</h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            Gestiona tus productos y stock de manera eficiente.
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all hover:shadow-md h-10 md:h-11"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <div className="bg-white p-2.5 md:p-3 rounded-xl border border-slate-200 flex items-center gap-2 shadow-sm">
        <Search className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
        <Input
          placeholder="Buscar producto, SKU o categoría..."
          className="border-0 shadow-none focus-visible:ring-0 px-0 h-8 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-slate-400 hover:text-slate-700 transition-colors mr-1"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <ProductList />
      <ProductForm />
    </div>
  );
}
