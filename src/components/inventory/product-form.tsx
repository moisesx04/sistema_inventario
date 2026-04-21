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
      const url = isEditing
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Error desconocido");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
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
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del producto y guarda los cambios."
              : "Completa el formulario para agregar un nuevo producto."}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="name">
                Nombre <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ej. Laptop Dell XPS 15"
                {...register("name", { required: "El nombre es requerido" })}
              />
              {errors.name && (
                <p className="text-xs text-rose-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sku">
                SKU (Código) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="sku"
                placeholder="Ej. LAP-001"
                disabled={isEditing}
                {...register("sku", { required: "El SKU es requerido" })}
              />
              {errors.sku && (
                <p className="text-xs text-rose-500">{errors.sku.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                placeholder="Ej. Electrónica"
                {...register("category")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price">
                Precio ($) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("price", {
                  required: "El precio es requerido",
                  min: { value: 0, message: "El precio no puede ser negativo" },
                })}
              />
              {errors.price && (
                <p className="text-xs text-rose-500">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stock">
                Stock <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                placeholder="0"
                {...register("stock", {
                  required: "El stock es requerido",
                  min: { value: 0, message: "El stock no puede ser negativo" },
                })}
              />
              {errors.stock && (
                <p className="text-xs text-rose-500">{errors.stock.message}</p>
              )}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                placeholder="Descripción breve del producto..."
                {...register("description")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]"
            >
              {mutation.isPending
                ? "Guardando..."
                : isEditing
                ? "Guardar cambios"
                : "Crear producto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
