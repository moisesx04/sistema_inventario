"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const routes = [
  {
    label: "Resumen",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Inventario",
    icon: Package,
    href: "/dashboard/inventory",
  },
  {
    label: "Configuración",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/login");
    router.refresh();
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white w-full p-4 border-r border-slate-800">
      <div className="px-3 py-4 mb-6">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={handleLinkClick}>
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-bold text-xl">Inventario 1</h1>
        </Link>
      </div>

      <div className="space-y-1 flex-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            onClick={handleLinkClick}
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-slate-800 rounded-lg transition-colors",
              pathname === route.href ? "text-white bg-slate-800" : "text-slate-400"
            )}
          >
            <div className="flex items-center flex-1">
              <route.icon className={cn("h-5 w-5 mr-3", pathname === route.href ? "text-indigo-400" : "text-slate-400")} />
              {route.label}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-800">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={() => {
            handleLogout();
            handleLinkClick();
          }}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Cerrar Sesión
        </Button>
        <p className="text-[10px] text-slate-600 text-center mt-3 leading-relaxed">
          Desarrollado por<br />
          <span className="text-slate-500 font-medium">Moises Cuevas</span>
        </p>
      </div>
    </div>
  );
}
