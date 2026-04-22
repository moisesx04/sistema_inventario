"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit2, Trash2, Package, Activity, Globe, HardDrive } from "lucide-react";
import { useInventoryStore, type Product } from "@/lib/store";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useEffect, useState } from "react";

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return <Badge variant="destructive" className="text-[10px] font-black uppercase tracking-tighter">AGOTADO</Badge>;
  if (stock < 10)
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[10px] font-black uppercase tracking-tighter">
        BAJO: {stock} uds.
      </Badge>
    );
  return (
    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[10px] font-black uppercase tracking-tighter">
      {stock} uds.
    </Badge>
  );
}

export function ProductList() {
  const { 
    searchQuery, 
    categoryFilter, 
    setEditingProduct, 
    isLocalMode, 
    toggleLocalMode,
    localProducts,
    deleteLocalProduct
  } = useInventoryStore();
  const [isMounted, setIsMounted] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 400);
  const debouncedCategory = useDebounce(categoryFilter, 400);
  const queryClient = useQueryClient();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const { data: cloudProducts, isLoading, isFetching } = useQuery<Product[]>({
    queryKey: ["products", debouncedQuery, debouncedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (debouncedCategory) params.set("category", debouncedCategory);
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error("Error al obtener productos");
      return response.json();
    },
    staleTime: 30_000,
    enabled: !isLocalMode,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isLocalMode) {
        deleteLocalProduct(id);
        return { success: true };
      }
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar");
      }
      return response.json();
    },
    onSuccess: () => {
      if (!isLocalMode) queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto eliminado");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (!isMounted) return null;

  const products = isLocalMode 
    ? localProducts.filter(p => 
        p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) || 
        p.sku.toLowerCase().includes(debouncedQuery.toLowerCase())
      ) 
    : cloudProducts;

  if (isLoading && !isLocalMode) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white mt-8 p-20 text-center shadow-2xl shadow-slate-200/50">
        <Activity className="h-10 w-10 text-indigo-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-bold tracking-tight">Sincronizando existencias...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      {/* Storage Selector */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/40 backdrop-blur-md rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/20">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl transition-colors",
            isLocalMode ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"
          )}>
            {isLocalMode ? <HardDrive className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Almacenamiento Activo</p>
            <p className="text-sm font-bold text-slate-900">
              {isLocalMode ? "Navegador Local (Offline)" : "Cloud Database (Supabase)"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Modo Local</span>
          <Switch 
            checked={isLocalMode} 
            onCheckedChange={toggleLocalMode}
            className="data-[state=checked]:bg-indigo-600"
          />
        </div>
      </div>

      <div className={`rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden transition-all duration-500 ${(!isLocalMode && isFetching) ? "opacity-60 blur-[1px]" : "opacity-100"}`}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 border-b border-slate-100">
                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 py-6 px-8">Producto</TableHead>
                <TableHead className="hidden md:table-cell font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 py-6">SKU</TableHead>
                <TableHead className="hidden sm:table-cell font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 py-6 text-center">Estado</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 py-6">Precio</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 py-6">Stock</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 py-6 px-8">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!products || products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 italic">
                    <Package className="h-10 w-10 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold text-lg">No se encontraron productos en el {isLocalMode ? "navegador" : "sistema"}.</p>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow
                    key={product.id}
                    className="hover:bg-slate-50/50 transition-all group border-b border-slate-50 last:border-0"
                  >
                    <TableCell className="py-6 px-8">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{product.name}</span>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-tight mt-1 group-hover:text-slate-500 transition-colors">
                          {product.category || "General"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-black text-[11px] text-slate-400 tracking-tight">
                      {product.sku}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center">
                      <div className={cn(
                        "size-2 rounded-full mx-auto",
                        product.stock <= 0 ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" : 
                        product.stock <= 5 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" : 
                        "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                      )} />
                    </TableCell>
                    <TableCell className="text-right font-black text-slate-900 italic tracking-tighter">
                      ${product.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <StockBadge stock={product.stock} />
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all hidden md:inline-flex"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (confirm(`¿Eliminar "${product.name}"?`)) {
                              deleteMutation.mutate(product.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
