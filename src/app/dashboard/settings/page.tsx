"use client";

import { useState, useEffect } from "react";
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
import { AlertTriangle, Trash2, Database, HardDrive, ArrowUpCircle, DownloadCloud } from "lucide-react";
import { useInventoryStore, type Product } from "@/lib/store";

export default function SettingsPage() {
  const [isPurgeDialogOpen, setIsPurgeDialogOpen] = useState(false);
  const [purgePassword, setPurgePassword] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const queryClient = useQueryClient();
  const { localProducts, setLocalProducts } = useInventoryStore();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const { data: cloudProducts } = useQuery<Product[]>({
    queryKey: ["products-for-import"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) return [];
      return response.json();
    },
    enabled: isMounted,
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
    <div className="p-4 md:p-10 max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 italic tracking-tight">Configuración</h1>
        <p className="text-slate-500 mt-1 text-sm md:text-base">
          Administra el almacenamiento y opciones avanzadas.
        </p>
      </div>

      {/* Storage Management */}
      <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
        <CardHeader className="bg-slate-50/50">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-indigo-600" />
            <CardTitle>Almacenamiento Local (Navegador)</CardTitle>
          </div>
          <CardDescription>
            Controla los datos guardados directamente en este navegador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <div>
              <p className="text-sm font-black text-indigo-900 uppercase tracking-tighter">Productos en Navegador</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">{localProducts.length}</p>
            </div>
            <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-600" onClick={clearLocal}>
              Limpiar Local
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              className="h-16 rounded-2xl bg-white border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all font-bold"
              onClick={importFromCloud}
            >
              <DownloadCloud className="mr-2 h-5 w-5" />
              Descargar de la Nube
            </Button>
            <Button 
              className="h-16 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-200"
              onClick={() => uploadLocalMutation.mutate()}
              disabled={uploadLocalMutation.isPending || localProducts.length === 0}
            >
              <ArrowUpCircle className="mr-2 h-5 w-5" />
              Subir Local a la Nube
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cloud Database Info */}
      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-600" />
            <CardTitle>Base de Datos Cloud</CardTitle>
          </div>
          <CardDescription>
            Sincronización con Supabase (PostgreSQL).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-sm font-bold text-slate-900">Sincronización Manual</p>
              <p className="text-xs text-slate-500 mt-1">Fuerza la actualización del esquema en la nube.</p>
            </div>
            <Button 
              onClick={() => syncMutation.mutate()} 
              disabled={syncMutation.isPending}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {syncMutation.isPending ? "Sincronizando..." : "Sincronizar Cloud DB"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Danger Zone */}
      <Card className="border-rose-200 shadow-sm bg-rose-50/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <CardTitle className="text-rose-800">Zona de Peligro</CardTitle>
          </div>
          <CardDescription className="text-rose-600/80">
            Estas acciones son irreversibles y afectan a la Base de Datos Cloud.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-white rounded-lg border border-rose-200">
            <div>
              <h3 className="text-sm font-semibold text-rose-900">
                Purgar Inventario Cloud
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Elimina permanentemente todos los productos de Supabase.
              </p>
            </div>
            <Button
              variant="destructive"
              className="shrink-0 bg-rose-600 hover:bg-rose-700"
              onClick={() => setIsPurgeDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Purgar Nube
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Purge Confirmation Dialog */}
      <Dialog
        open={isPurgeDialogOpen}
        onOpenChange={(open) => {
          if (!open) setPurgePassword("");
          setIsPurgeDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-rose-100 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
              <DialogTitle className="text-rose-900">
                Confirmar Purga de Nube
              </DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Esta acción eliminará todos los productos de **Supabase** de forma
              permanente. Ingresa la contraseña de administración.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePurge}>
            <div className="space-y-3 py-4">
              <Label htmlFor="purge-password" className="text-slate-700">
                Contraseña de confirmación
              </Label>
              <Input
                id="purge-password"
                type="password"
                placeholder="Ingresa la contraseña"
                value={purgePassword}
                onChange={(e) => setPurgePassword(e.target.value)}
                className="border-rose-200 focus-visible:ring-rose-400"
                required
                autoComplete="off"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPurgeDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={purgeMutation.isPending || !purgePassword}>
                {purgeMutation.isPending ? "Eliminando..." : "Confirmar y Purgar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
