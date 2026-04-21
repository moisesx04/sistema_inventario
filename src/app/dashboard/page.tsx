"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, TrendingUp, AlertTriangle, Box, ArrowRight, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) return [];
      return response.json();
    },
  });

  const totalProducts = products?.length || 0;
  const totalValue = products?.reduce((sum: number, p: any) => sum + (p.price * p.stock), 0) || 0;
  const lowStock = products?.filter((p: any) => p.stock > 0 && p.stock < 10).length || 0;
  const outOfStock = products?.filter((p: any) => p.stock === 0).length || 0;
  
  const recentProducts = products ? [...products].slice(0, 5) : [];

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <Activity className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-500">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900">Visión General</h1>
          <p className="text-slate-500 mt-1 md:mt-2 text-sm md:text-lg">Métricas en tiempo real de tu almacén.</p>
        </div>
        <Link href="/dashboard/inventory" className="w-full md:w-auto">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all hover:shadow-lg">
            Ir al Inventario <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Products Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 md:opacity-10 group-hover:opacity-20 transition-opacity">
            <Package className="h-16 md:h-24 w-16 md:w-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-indigo-900">Catálogo Activo</CardTitle>
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Package className="h-4 md:h-5 w-4 md:w-5 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-4xl font-black text-indigo-950">{totalProducts}</div>
            <p className="text-xs md:text-sm text-indigo-600/80 mt-1 font-medium">Productos registrados</p>
          </CardContent>
        </Card>
        
        {/* Total Value Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 md:opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="h-16 md:h-24 w-16 md:w-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-900">Capital Estimado</CardTitle>
            <div className="bg-emerald-100 p-2 rounded-lg">
              <TrendingUp className="h-4 md:h-5 w-4 md:w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-4xl font-black text-emerald-950">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs md:text-sm text-emerald-600/80 mt-1 font-medium">Valor total inventario</p>
          </CardContent>
        </Card>

        {/* Low Stock Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 md:opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle className="h-16 md:h-24 w-16 md:w-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-amber-900">Poco Stock</CardTitle>
            <div className="bg-amber-100 p-2 rounded-lg">
              <AlertTriangle className="h-4 md:h-5 w-4 md:w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-4xl font-black text-amber-950">{lowStock}</div>
            <p className="text-xs md:text-sm text-amber-600/80 mt-1 font-medium">Atención necesaria</p>
          </CardContent>
        </Card>

        {/* Out of Stock Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-50 to-white overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-4 opacity-5 md:opacity-10 group-hover:opacity-20 transition-opacity">
            <Box className="h-16 md:h-24 w-16 md:w-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-rose-900">Agotados</CardTitle>
            <div className="bg-rose-100 p-2 rounded-lg">
              <Box className="h-4 md:h-5 w-4 md:w-5 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-4xl font-black text-rose-950">{outOfStock}</div>
            <p className="text-xs md:text-sm text-rose-600/80 mt-1 font-medium">Stock agotado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Recent Items List */}
        <Card className="lg:col-span-2 border-slate-200/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl">Agregados Recientemente</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Últimos 5 productos ingresados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentProducts.length === 0 ? (
              <div className="text-center p-6 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                Aún no hay productos.
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {recentProducts.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between group gap-2">
                    <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
                      <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                        <Package className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                        <p className="text-[10px] md:text-xs text-slate-500 font-mono mt-0.5 truncate">{product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-slate-900">${product.price.toFixed(0)}</p>
                      <Badge variant="outline" className="mt-1 text-[9px] md:text-[10px] px-1 md:px-1.5 py-0">
                        {product.stock} uds.
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Panel */}
        <Card className="border-slate-200/60 shadow-sm bg-slate-900 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl text-white font-bold">Salud del Inventario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 md:space-y-6">
            {totalProducts === 0 ? (
              <div className="text-slate-400 text-sm">Sin datos.</div>
            ) : (
              <>
                {[
                  { label: "Óptimo", color: "bg-emerald-500", text: "text-emerald-400", val: ((totalProducts - lowStock - outOfStock) / totalProducts) * 100 },
                  { label: "Bajo", color: "bg-amber-500", text: "text-amber-400", val: (lowStock / totalProducts) * 100 },
                  { label: "Cero", color: "bg-rose-500", text: "text-rose-400", val: (outOfStock / totalProducts) * 100 },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className={item.text}>{item.label}</span>
                      <span className="font-medium">{item.val.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 md:h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.val}%` }}></div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-slate-800">
                  <p className="text-[11px] md:text-xs text-slate-400 leading-relaxed">
                    Mantén las métricas en verde reabasteciendo productos críticos.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
