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
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventario</h1>
          <p className="text-slate-500 mt-1">
            Gestiona tus productos, stock y precios de manera eficiente.
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all hover:shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2 shadow-sm">
        <Search className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
        <Input
          placeholder="Buscar por nombre, SKU o descripción..."
          className="border-0 shadow-none focus-visible:ring-0 px-0 h-8"
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
