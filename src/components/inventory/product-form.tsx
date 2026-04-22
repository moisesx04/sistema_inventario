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
      <DialogContent className="w-[95vw] sm:max-w-[450px] p-0 overflow-y-auto max-h-[92vh] border-none shadow-2xl bg-white rounded-3xl">
        {/* Header - Simple & Clean */}
        <div className="p-6 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-20">
          <DialogHeader>
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                {isEditing ? "Editar Producto" : "Nuevo Producto"}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <DialogDescription className="text-slate-500 font-medium text-xs">
                  {isLocalMode ? "Almacenamiento Local" : "Sincronizado con la Nube"}
                </DialogDescription>
                {isLocalMode && (
                  <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Local
                  </span>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-6 pb-24">
          <div className="space-y-5">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                Nombre del Producto
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  className="h-12 px-4 border-slate-200 bg-white focus:border-indigo-600 focus:ring-0 transition-all font-semibold text-slate-900 rounded-xl"
                  placeholder="Ej. Laptop Dell XPS 15"
                  {...register("name", { required: "El nombre es requerido" })}
                />
                <Package className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
              </div>
              {errors.name && (
                <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.name.message}</p>
              )}
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                Código SKU
              </Label>
              <div className="relative">
                <Input
                  id="sku"
                  disabled={isEditing}
                  className="h-12 px-4 border-slate-200 bg-white focus:border-indigo-600 focus:ring-0 transition-all font-semibold text-slate-900 rounded-xl disabled:bg-slate-50 disabled:text-slate-400"
                  placeholder="LAP-001"
                  {...register("sku", { required: "El SKU es requerido" })}
                />
                <Barcode className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
              </div>
              {errors.sku && (
                <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.sku.message}</p>
              )}
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                Categoría
              </Label>
              <div className="relative">
                <Input
                  id="category"
                  className="h-12 px-4 border-slate-200 bg-white focus:border-indigo-600 focus:ring-0 transition-all font-semibold text-slate-900 rounded-xl"
                  placeholder="Electrónica"
                  {...register("category")}
                />
                <Tag className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
              </div>
            </div>

            {/* Precio y Stock en una fila solo en escritorio, vertical en móvil */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Precio ($)
                </Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    className="h-12 px-4 border-slate-200 bg-white focus:border-indigo-600 focus:ring-0 transition-all font-bold text-slate-900 rounded-xl"
                    placeholder="0.00"
                    {...register("price", {
                      required: "Requerido",
                      min: { value: 0, message: "No negativo" },
                    })}
                  />
                  <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Stock
                </Label>
                <div className="relative">
                  <Input
                    id="stock"
                    type="number"
                    className="h-12 px-4 border-slate-200 bg-white focus:border-indigo-600 focus:ring-0 transition-all font-bold text-slate-900 rounded-xl"
                    placeholder="0"
                    {...register("stock", {
                      required: "Requerido",
                      min: { value: 0, message: "No negativo" },
                    })}
                  />
                  <Layers className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                Descripción
              </Label>
              <div className="relative">
                <Input
                  id="description"
                  className="h-20 px-4 border-slate-200 bg-white focus:border-indigo-600 focus:ring-0 transition-all font-medium text-slate-900 rounded-xl pt-3"
                  placeholder="Detalles del producto..."
                  {...register("description")}
                />
                <FileText className="absolute right-4 top-4 size-4 text-slate-300" />
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions - Sticky at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 flex items-center gap-3 z-30">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={closeDialog}
            className="flex-1 h-12 font-bold text-slate-400 hover:text-slate-600"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="product-form-element"
            onClick={handleSubmit((d) => mutation.mutate(d))}
            disabled={mutation.isPending}
            className="flex-[2] h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Activity className="size-4 animate-spin mr-2" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            {mutation.isPending ? "Guardando..." : (isEditing ? "Guardar" : "Crear Producto")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
