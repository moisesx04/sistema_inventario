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
  
  // Sort by created date (newest first) and take top 5
  const recentProducts = products ? [...products].slice(0, 5) : [];

  if (isLoading) {
    return <div className="p-10 flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse flex flex-col items-center">
        <Activity className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500">Cargando métricas del sistema...</p>
      </div>
    </div>;
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Visión General</h1>
          <p className="text-slate-500 mt-2 text-lg">Métricas en tiempo real de tu almacén.</p>
        </div>
        <Link href="/dashboard/inventory">
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all hover:shadow-lg">
            Ir al Inventario <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {/* Total Products Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Package className="h-24 w-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-indigo-900">Catálogo Activo</CardTitle>
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Package className="h-5 w-5 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-indigo-950">{totalProducts}</div>
            <p className="text-sm text-indigo-600/80 mt-1 font-medium">Productos registrados</p>
          </CardContent>
        </Card>
        
        {/* Total Value Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="h-24 w-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-900">Capital Estimado</CardTitle>
            <div className="bg-emerald-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-emerald-950">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-sm text-emerald-600/80 mt-1 font-medium">Valor total en inventario</p>
          </CardContent>
        </Card>

        {/* Low Stock Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle className="h-24 w-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-amber-900">Poco Stock</CardTitle>
            <div className="bg-amber-100 p-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-amber-950">{lowStock}</div>
            <p className="text-sm text-amber-600/80 mt-1 font-medium">Requieren atención pronto</p>
          </CardContent>
        </Card>

        {/* Out of Stock Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-50 to-white overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Box className="h-24 w-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-rose-900">Agotados</CardTitle>
            <div className="bg-rose-100 p-2 rounded-lg">
              <Box className="h-5 w-5 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-rose-950">{outOfStock}</div>
            <p className="text-sm text-rose-600/80 mt-1 font-medium">Stock en cero absoluto</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Items List */}
        <Card className="md:col-span-2 border-slate-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Agregados Recientemente</CardTitle>
            <CardDescription>
              Los últimos 5 productos que se ingresaron al sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentProducts.length === 0 ? (
              <div className="text-center p-6 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                Aún no hay productos en el inventario.
              </div>
            ) : (
              <div className="space-y-6">
                {recentProducts.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between group">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                        <Package className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{product.sku} • {product.category || "Sin categoría"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">${product.price.toFixed(2)}</p>
                      {product.stock === 0 ? (
                        <Badge variant="destructive" className="mt-1 text-[10px] px-1.5 py-0">Agotado</Badge>
                      ) : product.stock < 10 ? (
                        <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0 border-amber-200 bg-amber-50 text-amber-700">Poco: {product.stock}</Badge>
                      ) : (
                        <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0 border-emerald-200 bg-emerald-50 text-emerald-700">Stock: {product.stock}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions / Health */}
        <Card className="border-slate-200/60 shadow-sm bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-xl text-white">Salud del Inventario</CardTitle>
            <CardDescription className="text-slate-400">
              Desglose rápido de disponibilidad.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {totalProducts === 0 ? (
              <div className="text-slate-400 text-sm">Sin datos para analizar.</div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-400 flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>Óptimo</span>
                    <span className="font-medium">{((totalProducts - lowStock - outOfStock) / totalProducts * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${((totalProducts - lowStock - outOfStock) / totalProducts) * 100}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-amber-400 flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>Por Reabastecer</span>
                    <span className="font-medium">{((lowStock) / totalProducts * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(lowStock / totalProducts) * 100}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-rose-400 flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-2"></span>Agotado</span>
                    <span className="font-medium">{((outOfStock) / totalProducts * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(outOfStock / totalProducts) * 100}%` }}></div>
                  </div>
                </div>
                
                <div className="pt-6 mt-6 border-t border-slate-800">
                  <p className="text-sm text-slate-400 mb-4">
                    Mantén tus métricas en verde reabasteciendo a tiempo los productos con alertas amarillas.
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
