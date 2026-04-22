"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useInventoryStore } from "@/lib/store";
import { useEffect } from "react";
import { 
  Package, 
  Tag, 
  DollarSign, 
  Layers, 
  FileText, 
  Barcode,
  Save,
  X,
  Plus,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

type ProductFormData = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  sku: string;
};

export function ProductForm() {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    editingProduct,
    setEditingProduct,
    isLocalMode,
    addLocalProduct,
    updateLocalProduct
  } = useInventoryStore();
  const queryClient = useQueryClient();

  const isEditing = !!editingProduct;
  const isOpen = isAddModalOpen || isEditing;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stock: "0",
      category: "",
      sku: "",
    },
  });

  useEffect(() => {
    if (editingProduct) {
      setValue("name", editingProduct.name);
      setValue("description", editingProduct.description || "");
      setValue("price", editingProduct.price.toString());
      setValue("stock", editingProduct.stock.toString());
      setValue("category", editingProduct.category || "");
      setValue("sku", editingProduct.sku);
    } else {
      reset();
    }
  }, [editingProduct, setValue, reset]);

  const closeDialog = () => {
    setIsAddModalOpen(false);
    setEditingProduct(null);
    reset();
  };

  const mutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        stock: parseInt(data.stock, 10),
      };

      if (isLocalMode) {
        if (isEditing && editingProduct) {
          updateLocalProduct(editingProduct.id, payload);
        } else {
          addLocalProduct(payload);
        }
        return { success: true };
      }

      const url = isEditing && editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Error desconocido");
      return json;
    },
    onSuccess: () => {
      if (!isLocalMode) {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      }
      toast.success(
        isEditing ? "Producto actualizado correctamente" : "Producto creado exitosamente"
      );
      closeDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="w-[95vw] sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl bg-white/95 backdrop-blur-xl">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-6 text-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  {isEditing ? <Save className="size-5" /> : <Plus className="size-5" />}
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black tracking-tight text-white">
                    {isEditing ? "✨ Editar Detalles" : "✨ Registro de Producto Premium"}
                  </DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <DialogDescription className="text-indigo-100 font-medium text-xs">
                      Gestión de inventario {isLocalMode ? "(Offline)" : "(Cloud)"}
                    </DialogDescription>
                    {isLocalMode && (
                      <span className="bg-amber-400 text-amber-950 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        Local
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {/* Nombre */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Nombre del Producto
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Package className="size-4" />
                </div>
                <Input
                  id="name"
                  className="pl-10 h-12 border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-slate-900"
                  placeholder="Ej. Laptop Dell XPS 15"
                  {...register("name", { required: "El nombre es requerido" })}
                />
              </div>
              {errors.name && (
                <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.name.message}</p>
              )}
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Código SKU
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Barcode className="size-4" />
                </div>
                <Input
                  id="sku"
                  disabled={isEditing}
                  className="pl-10 h-12 border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-slate-900"
                  placeholder="LAP-001"
                  {...register("sku", { required: "El SKU es requerido" })}
                />
              </div>
              {errors.sku && (
                <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.sku.message}</p>
              )}
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Categoría
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Tag className="size-4" />
                </div>
                <Input
                  id="category"
                  className="pl-10 h-12 border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-slate-900"
                  placeholder="Electrónica"
                  {...register("category")}
                />
              </div>
            </div>

            {/* Precio */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Precio Unitario
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <DollarSign className="size-4" />
                </div>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  className="pl-10 h-12 border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all font-black text-slate-900"
                  placeholder="0.00"
                  {...register("price", {
                    required: "Requerido",
                    min: { value: 0, message: "No negativo" },
                  })}
                />
              </div>
              {errors.price && (
                <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.price.message}</p>
              )}
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <Label htmlFor="stock" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Stock Inicial
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Layers className="size-4" />
                </div>
                <Input
                  id="stock"
                  type="number"
                  className="pl-10 h-12 border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all font-black text-slate-900"
                  placeholder="0"
                  {...register("stock", {
                    required: "Requerido",
                    min: { value: 0, message: "No negativo" },
                  })}
                />
              </div>
              {errors.stock && (
                <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.stock.message}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Información Adicional
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <FileText className="size-4" />
                </div>
                <Input
                  id="description"
                  className="pl-10 h-24 border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-900 align-top pt-3"
                  placeholder="Agrega detalles relevantes del producto..."
                  {...register("description")}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={closeDialog}
              className="flex-1 h-12 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <X className="size-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="flex-[2] h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {mutation.isPending ? (
                <Activity className="size-4 animate-spin mr-2" />
              ) : (
                <Save className="size-4 mr-2" />
              )}
              {mutation.isPending
                ? "Procesando..."
                : isEditing
                ? "Guardar Cambios"
                : "Crear Producto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
