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
import { Edit2, Trash2, Package } from "lucide-react";
import { useInventoryStore } from "@/lib/store";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  sku: string;
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return <Badge variant="destructive">Agotado</Badge>;
  if (stock < 10)
    return (
      <Badge className="bg-amber-50 text-amber-800 hover:bg-amber-50 border border-amber-200">
        Poco: {stock}
      </Badge>
    );
  return (
    <Badge className="bg-emerald-50 text-emerald-800 hover:bg-emerald-50 border border-emerald-200">
      {stock} uds.
    </Badge>
  );
}

export function ProductList() {
  const { searchQuery, categoryFilter, setEditingProduct } = useInventoryStore();
  const debouncedQuery = useDebounce(searchQuery, 400);
  const debouncedCategory = useDebounce(categoryFilter, 400);
  const queryClient = useQueryClient();

  const { data: products, isLoading, isFetching } = useQuery<Product[]>({
    queryKey: ["products", debouncedQuery, debouncedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (debouncedCategory) params.set("category", debouncedCategory);
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error("Error al obtener productos");
      return response.json();
    },
    staleTime: 30_000, // 30s cache
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto eliminado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white mt-6 p-10 text-center">
        <Package className="h-8 w-8 text-slate-300 animate-pulse mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border bg-white mt-6 transition-opacity ${isFetching ? "opacity-70" : "opacity-100"}`}>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 rounded-t-xl">
            <TableHead className="font-semibold text-slate-600">SKU</TableHead>
            <TableHead className="font-semibold text-slate-600">Nombre</TableHead>
            <TableHead className="font-semibold text-slate-600">Categoría</TableHead>
            <TableHead className="text-right font-semibold text-slate-600">Precio</TableHead>
            <TableHead className="text-center font-semibold text-slate-600">Stock</TableHead>
            <TableHead className="text-right font-semibold text-slate-600">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!products || products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-32">
                <Package className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">
                  {searchQuery
                    ? "No se encontraron productos con esa búsqueda."
                    : "El inventario está vacío. Agrega el primer producto."}
                </p>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow
                key={product.id}
                className="hover:bg-slate-50 transition-colors group"
              >
                <TableCell className="font-mono text-xs text-slate-500">
                  {product.sku}
                </TableCell>
                <TableCell className="font-medium text-slate-900">
                  {product.name}
                  {product.description && (
                    <p className="text-xs text-slate-400 font-normal mt-0.5 truncate max-w-xs">
                      {product.description}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  {product.category ? (
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                      {product.category}
                    </span>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-semibold text-slate-800">
                  ${product.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <StockBadge stock={product.stock} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
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
  );
}
