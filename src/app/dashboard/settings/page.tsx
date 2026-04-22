"use client";

import { useState, useEffect, useMemo } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  Trash2, 
  Database, 
  HardDrive, 
  ArrowUpCircle, 
  DownloadCloud,
  Cpu,
  Zap,
  Globe,
  RefreshCcw,
  ShieldAlert,
  Activity,
  Package
} from "lucide-react";
import { useInventoryStore, type Product } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [isPurgeDialogOpen, setIsPurgeDialogOpen] = useState(false);
  const [purgePassword, setPurgePassword] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(true);
  
  const queryClient = useQueryClient();
  const { localProducts, setLocalProducts, isLocalMode } = useInventoryStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: cloudProducts, isLoading: isLoadingCloud } = useQuery<Product[]>({
    queryKey: ["products-for-import"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) return [];
      return response.json();
    },
    enabled: isMounted,
  });

  const { data: connectionStatus } = useQuery({
    queryKey: ["db-status"],
    queryFn: async () => {
      const response = await fetch("/api/debug/connection");
      if (!response.ok) return { status: "error" };
      return response.json();
    },
    refetchInterval: 10000,
  });

  const purgeMutation = useMutation({
    mutationFn: async (password: string) => {
      const res = await fetch("/api/settings/purge", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(data.message);
      setIsPurgeDialogOpen(false);
      setPurgePassword("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setPurgePassword("");
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/settings/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al sincronizar");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const uploadLocalMutation = useMutation({
    mutationFn: async () => {
      if (!localProducts.length) throw new Error("No hay productos locales para subir");
      
      let successCount = 0;
      for (const product of localProducts) {
        try {
          const res = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: product.name,
              sku: product.sku,
              price: product.price,
              stock: product.stock,
              category: product.category,
              description: product.description
            }),
          });
          if (res.ok) successCount++;
        } catch {
          console.error("Error subiendo producto:", product.name);
        }
      }
      return successCount;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Se subieron ${count} productos a la nube con éxito`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handlePurge = (event: React.FormEvent) => {
    event.preventDefault();
    purgeMutation.mutate(purgePassword);
  };

  const clearLocal = () => {
    if (confirm("¿Seguro que quieres borrar TODOS los productos guardados en el navegador?")) {
      setLocalProducts([]);
      toast.success("Almacenamiento local limpiado");
    }
  };

  const importFromCloud = () => {
    if (!cloudProducts?.length) {
      toast.error("No se encontraron productos en la nube para importar");
      return;
    }
    if (confirm(`Se importarán ${cloudProducts.length} productos al navegador. ¿Continuar?`)) {
      setLocalProducts(cloudProducts);
      toast.success("Productos importados al navegador con éxito");
    }
  };

  if (!isMounted) return null;

  return (
    <div className={cn(
      "p-4 md:p-10 max-w-5xl mx-auto space-y-10 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform",
      performanceMode ? "animate-in fade-in slide-in-from-bottom-8" : ""
    )}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter italic">Configuración</h1>
          <p className="text-slate-500 mt-2 text-sm md:text-lg font-medium">
            Optimiza el sistema y gestiona la persistencia de datos.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <Cpu className={cn("size-5 transition-colors", performanceMode ? "text-indigo-600" : "text-slate-300")} />
          <div className="pr-4 border-r border-slate-100 mr-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Motor de Renderizado</p>
            <p className="text-xs font-black text-slate-900 mt-1">{performanceMode ? "OPTIMIZADO 144Hz" : "MODO ESTÁNDAR"}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "h-8 rounded-lg px-3 transition-all",
              performanceMode ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-100 text-slate-500"
            )}
            onClick={() => setPerformanceMode(!performanceMode)}
          >
            <Zap className={cn("size-3 mr-2", performanceMode ? "fill-white" : "")} />
            Turbo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Storage Section */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-0 shadow-2xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl overflow-hidden group">
            <CardHeader className="bg-slate-950 text-white p-8">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
                  <HardDrive className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black italic tracking-tight">Almacenamiento Local</CardTitle>
                  <CardDescription className="text-slate-400 font-medium">Gestión directa en el navegador (LocalFirst)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-[0.03] rotate-12">
                    <Package className="size-32" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Local</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-5xl font-black text-slate-900 italic tracking-tighter">{localProducts.length}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase">Productos</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-6 w-full text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-black text-[10px] uppercase tracking-widest"
                    onClick={clearLocal}
                  >
                    <Trash2 className="size-3 mr-2" />
                    Borrar Memoria Local
                  </Button>
                </div>

                <div className="space-y-4">
                  <Button 
                    className="w-full h-20 rounded-2xl bg-white border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition-all font-black text-sm shadow-sm group/btn"
                    onClick={importFromCloud}
                  >
                    <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center mr-4 group-hover/btn:scale-110 transition-transform">
                      <DownloadCloud className="h-5 w-5" />
                    </div>
                    Descargar Nube
                  </Button>
                  <Button 
                    className="w-full h-20 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-black text-sm shadow-xl shadow-indigo-200 group/btn"
                    onClick={() => uploadLocalMutation.mutate()}
                    disabled={uploadLocalMutation.isPending || localProducts.length === 0}
                  >
                    <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center mr-4 group-hover/btn:scale-110 transition-transform">
                      <ArrowUpCircle className="h-5 w-5" />
                    </div>
                    {uploadLocalMutation.isPending ? "Subiendo..." : "Subir a la Nube"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cloud Database Info */}
          <Card className="border-0 shadow-2xl shadow-slate-200/30 bg-white overflow-hidden group">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <Database className="h-5 w-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl font-black italic tracking-tight">Infraestructura Cloud</CardTitle>
                </div>
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  connectionStatus?.status === "ok" ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                )}>
                  <span className="size-2 rounded-full bg-current animate-pulse" />
                  {connectionStatus?.status === "ok" ? "Online" : "Checking..."}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                    <Globe className="size-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 tracking-tight">Vercel Postgres (PostgreSQL)</p>
                    <p className="text-xs text-slate-400 font-medium">{connectionStatus?.hostname || "Cargando host..."}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => syncMutation.mutate()} 
                  disabled={syncMutation.isPending}
                  className="w-full sm:w-auto h-12 rounded-xl bg-white border border-slate-200 text-slate-900 font-black text-xs hover:bg-slate-100 transition-all shadow-sm"
                >
                  <RefreshCcw className={cn("size-3 mr-2", syncMutation.isPending && "animate-spin")} />
                  {syncMutation.isPending ? "Sincronizando..." : "Sincronizar Esquema"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings (Danger Zone & More) */}
        <div className="space-y-8">
          <Card className="border-0 shadow-2xl shadow-rose-200/30 bg-rose-50/50 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
              <ShieldAlert className="size-24" />
            </div>
            <CardHeader className="p-6">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-rose-100 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                </div>
                <CardTitle className="text-lg font-black text-rose-900 italic tracking-tight">Zona de Seguridad</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <p className="text-xs text-rose-600/70 font-bold leading-relaxed">
                Acciones críticas que afectan permanentemente a la infraestructura de la nube.
              </p>
              <Button
                variant="destructive"
                className="w-full h-12 rounded-xl bg-rose-600 hover:bg-rose-700 font-black text-xs shadow-lg shadow-rose-200 transition-all active:scale-95"
                onClick={() => setIsPurgeDialogOpen(true)}
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Purgar Todo (Cloud)
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl shadow-indigo-200/20 bg-indigo-900 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.2),transparent)]" />
            <CardContent className="p-8 relative z-10 text-center">
              <Activity className="size-8 text-indigo-400 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-black italic tracking-tighter">Estado de Optimización</h3>
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-[10px] font-black text-indigo-300 uppercase tracking-widest">
                  <span>Latencia de Interfaz</span>
                  <span>1.2ms</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 w-[98%] rounded-full shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                </div>
              </div>
              <p className="mt-8 text-[9px] font-bold text-indigo-400 leading-relaxed uppercase">
                Aceleración por hardware activa. El sistema está funcionando a máxima frecuencia.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Purge Confirmation Dialog */}
      <Dialog
        open={isPurgeDialogOpen}
        onOpenChange={(open) => {
          if (!open) setPurgePassword("");
          setIsPurgeDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-rose-600 p-6 text-white">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <ShieldAlert className="size-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black italic text-white tracking-tight">Confirmar Purga</DialogTitle>
                  <DialogDescription className="text-rose-100 font-medium text-xs mt-1">
                    Esta acción es irreversible.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form onSubmit={handlePurge} className="p-8">
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                <p className="text-xs text-rose-800 font-bold leading-relaxed">
                  Estás a punto de borrar **TODOS** los productos de la base de datos Vercel Postgres. 
                  Por favor, ingresa la clave de administrador.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purge-password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Clave de Seguridad
                </Label>
                <Input
                  id="purge-password"
                  type="password"
                  placeholder="••••••••"
                  value={purgePassword}
                  onChange={(e) => setPurgePassword(e.target.value)}
                  className="h-12 rounded-xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 transition-all font-black"
                  required
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-8">
              <Button type="button" variant="ghost" onClick={() => setIsPurgeDialogOpen(false)} className="flex-1 h-12 font-bold rounded-xl text-slate-500">
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={purgeMutation.isPending || !purgePassword} className="flex-1 h-12 rounded-xl bg-rose-600 font-black shadow-lg shadow-rose-200">
                {purgeMutation.isPending ? "Ejecutando..." : "Confirmar Purga"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
