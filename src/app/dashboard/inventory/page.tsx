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
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 italic">
            Almacén
          </h1>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            <span className="size-2 rounded-full bg-indigo-500" />
            Control de existencias en tiempo real
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto bg-slate-900 hover:bg-indigo-600 text-white shadow-2xl shadow-slate-200 h-12 md:h-14 px-8 rounded-2xl font-black italic tracking-tight transition-all active:scale-95"
        >
          <Plus className="h-5 w-5 mr-2 stroke-[3px]" />
          AGREGAR PRODUCTO
        </Button>
      </div>

      <div className="group bg-white p-2 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-2xl shadow-slate-200/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center group-focus-within:bg-indigo-50 transition-colors">
          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
        </div>
        <Input
          placeholder="Filtrar por nombre, SKU o categoría..."
          className="border-0 shadow-none focus-visible:ring-0 px-1 h-10 text-base font-medium placeholder:text-slate-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all mr-1"
          >
            <X className="h-4 w-4 stroke-[3px]" />
          </button>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white/80 pointer-events-none z-10 h-12 bottom-0 top-auto" />
        <ProductList />
      </div>
      <ProductForm />
    </div>
  );
}
