"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { AlertTriangle, Trash2, Shield, Lock, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [isPurgeDialogOpen, setIsPurgeDialogOpen] = useState(false);
  const [purgePassword, setPurgePassword] = useState("");
  const queryClient = useQueryClient();

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

  const handlePurge = (e: React.FormEvent) => {
    e.preventDefault();
    purgeMutation.mutate(purgePassword);
  };

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-500 mt-1 text-sm md:text-base">
          Administra las opciones avanzadas del sistema.
        </p>
      </div>

      {/* System Info */}
      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-600" />
            <CardTitle>Base de Datos Local</CardTitle>
          </div>
          <CardDescription>
            Información sobre el entorno de datos local de esta instalación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Motor</p>
              <p className="text-sm font-semibold text-slate-800">PostgreSQL</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">ORM</p>
              <p className="text-sm font-semibold text-slate-800">Prisma v7</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Entorno</p>
              <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-none text-xs">
                {process.env.NODE_ENV === "production" ? "PRODUCCIÓN CLOUD" : "DEMO LOCAL"}
              </Badge>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <div>
              <p className="text-sm font-bold text-indigo-900">¿Primer despliegue en Vercel?</p>
              <p className="text-xs text-indigo-700/70 mt-1">Sincroniza el esquema para habilitar la creación de productos.</p>
            </div>
            <Button 
              onClick={() => syncMutation.mutate()} 
              disabled={syncMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
            >
              {syncMutation.isPending ? "Sincronizando..." : "Sincronizar Cloud DB"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Credentials Info */}
      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-indigo-600" />
            <CardTitle>Credenciales de Acceso</CardTitle>
          </div>
          <CardDescription>
            Credenciales configuradas para esta demo. Cambiarlas antes de
            pasar a producción.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-1">Usuario del sistema</p>
              <p className="font-mono font-semibold text-slate-800">admin</p>
            </div>
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-1">Contraseña del sistema</p>
              <p className="font-mono font-semibold text-slate-800">admin</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Estas credenciales serán reemplazadas por un sistema seguro antes del despliegue en producción.
          </p>
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
            Estas acciones son irreversibles. Procede con extrema precaución.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-white rounded-lg border border-rose-200">
            <div>
              <h3 className="text-sm font-semibold text-rose-900">
                Purgar Inventario Local
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Elimina permanentemente todos los productos de la base de datos
                local. Esta acción requiere contraseña y no se puede deshacer.
              </p>
            </div>
            <Button
              variant="destructive"
              className="shrink-0 bg-rose-600 hover:bg-rose-700"
              onClick={() => setIsPurgeDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Purgar Datos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Purge Confirmation Dialog */}
      <Dialog
        open={isPurgeDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPurgePassword("");
          }
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
                Confirmar Purga de Datos
              </DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Esta acción eliminará{" "}
              <strong>todos los productos del inventario local</strong> de forma
              permanente. Ingresa la contraseña de administración para
              continuar.
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
                placeholder="Ingresa la contraseña de administración"
                value={purgePassword}
                onChange={(e) => setPurgePassword(e.target.value)}
                className="border-rose-200 focus-visible:ring-rose-400"
                required
                autoComplete="off"
              />
              <p className="text-xs text-slate-400">
                Pista: no es la misma contraseña de inicio de sesión.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPurgeDialogOpen(false);
                  setPurgePassword("");
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={purgeMutation.isPending || !purgePassword}
                className="bg-rose-600 hover:bg-rose-700"
              >
                {purgeMutation.isPending ? "Eliminando..." : "Confirmar y Purgar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
