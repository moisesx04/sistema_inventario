"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="flex md:hidden items-center justify-between px-4 h-16 border-b bg-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Package className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-slate-900">Inventario 1</span>
        </div>
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <div 
              role="button"
              tabIndex={0}
              className="md:hidden flex items-center justify-center size-8 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <Menu className="h-6 w-6 text-slate-600" />
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-slate-900 border-none">
            <SheetHeader className="sr-only">
              <SheetTitle>Menú de Navegación</SheetTitle>
            </SheetHeader>
            <Sidebar onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
