"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, TrendingUp, AlertTriangle, Box, ArrowRight, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useInventoryStore, type Product } from "@/lib/store";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { isLocalMode, localProducts } = useInventoryStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: cloudProducts, isLoading: isLoadingCloud } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) return [];
      return response.json();
    },
    enabled: mounted && !isLocalMode, // Only fetch cloud if not in local mode
  });

  // Decide which products to show
  const products = isLocalMode ? localProducts : (cloudProducts || []);
  const isLoading = !mounted || (isLoadingCloud && !isLocalMode);

  const totalProducts = products.length;
  const totalValue = products.reduce((sum: number, p: Product) => sum + (p.price * p.stock), 0);
  const lowStock = products.filter((p: Product) => p.stock > 0 && p.stock < 10).length;
  const outOfStock = products.filter((p: Product) => p.stock === 0).length;
  
  const recentProducts = [...products].slice(0, 5);

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
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900">
            Visión General
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-lg font-medium">
            Estado actual de <span className="text-indigo-600 font-extrabold uppercase tracking-widest text-xs ml-1 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">Inventario 1</span>
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className={cn(
            "size-10 rounded-xl flex items-center justify-center",
            isLocalMode ? "bg-amber-500/10" : "bg-emerald-500/10"
          )}>
            <Activity className={cn(
              "h-5 w-5",
              isLocalMode ? "text-amber-600" : "text-emerald-600 animate-pulse"
            )} />
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistema</p>
            <p className="text-xs font-black text-slate-900">
              {isLocalMode ? "MODO NAVEGADOR" : "MODO NUBE"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Value Card - The "Hero" Stat */}
        <Card className="border-0 shadow-2xl shadow-indigo-500/20 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white overflow-hidden relative group scale-100 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute -right-6 -top-6 bg-white/10 size-32 rounded-full blur-3xl group-hover:size-40 transition-all duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-indigo-100 uppercase tracking-widest">Capital Total</CardTitle>
            <TrendingUp className="h-5 w-5 text-indigo-300" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-black tracking-tighter italic">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase">Valor en Almacén</span>
            </div>
          </CardContent>
        </Card>

        {/* Regular Stats */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white hover:shadow-indigo-500/5 transition-all group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Productos</CardTitle>
            <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
              <Package className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 tracking-tighter italic">{totalProducts}</div>
            <div className="h-1 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-indigo-500 w-2/3 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white hover:shadow-amber-500/5 transition-all group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stock Crítico</CardTitle>
            <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-amber-50 transition-colors">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-600 tracking-tighter italic">{lowStock}</div>
            <p className="text-[10px] font-bold text-amber-600/60 mt-2 uppercase">Requiere Reabasto</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white hover:shadow-rose-500/5 transition-all group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Agotados</CardTitle>
            <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-rose-50 transition-colors">
              <Box className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-rose-600 tracking-tighter italic">{outOfStock}</div>
            <p className="text-[10px] font-bold text-rose-600/60 mt-2 uppercase">Sin Existencias</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Recent Items List */}
        <Card className="lg:col-span-2 border-0 shadow-2xl shadow-slate-200/40 bg-white overflow-hidden">
          <CardHeader className="pb-6 bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Actividad Reciente</CardTitle>
                <CardDescription className="font-medium">Últimos ingresos al inventario</CardDescription>
              </div>
              <Link href="/dashboard/inventory">
                <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold">
                  Ver Todo <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentProducts.length === 0 ? (
              <div className="text-center p-12 text-slate-400 font-bold italic">
                Aún no hay productos registrados.
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentProducts.map((product: Product) => (
                  <div key={product.id} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-all group">
                    <div className="flex items-center space-x-4">
                      <div className="size-12 rounded-2xl bg-white shadow-lg shadow-slate-100 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Package className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{product.name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-0.5">{product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900 tracking-tight">${product.price.toLocaleString()}</p>
                      <Badge className={cn(
                        "mt-1.5 border-none text-[9px] font-black px-2 py-0",
                        product.stock <= 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                      )}>
                        {product.stock} UNIDADES
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Panel */}
        <Card className="border-0 shadow-2xl shadow-slate-200/40 bg-slate-950 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Activity className="h-32 w-32" />
          </div>
          <CardHeader className="pb-6 border-b border-white/5">
            <CardTitle className="text-xl text-white font-black tracking-tight italic">Salud Operativa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pt-8 relative z-10">
            {totalProducts === 0 ? (
              <div className="text-slate-500 text-sm font-bold italic">Esperando datos de sistema...</div>
            ) : (
              <>
                {[
                  { label: "Óptimo", color: "bg-emerald-500", shadow: "shadow-emerald-500/40", text: "text-emerald-400", val: ((totalProducts - lowStock - outOfStock) / totalProducts) * 100 },
                  { label: "Bajo Stock", color: "bg-amber-500", shadow: "shadow-amber-500/40", text: "text-amber-400", val: (lowStock / totalProducts) * 100 },
                  { label: "Sin Stock", color: "bg-rose-500", shadow: "shadow-rose-500/40", text: "text-rose-400", val: (outOfStock / totalProducts) * 100 },
                ].map((item) => (
                  <div key={item.label} className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                      <span className={item.text}>{item.label}</span>
                      <span className="text-white">{item.val.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-1000 shadow-lg", item.color, item.shadow)} style={{ width: `${item.val}%` }}></div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-6 border-t border-white/5">
                  <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
                    <p className="text-[10px] font-bold text-indigo-300 leading-relaxed uppercase tracking-tighter text-center">
                      Mantén los indicadores en verde para maximizar la rentabilidad.
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
