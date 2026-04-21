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
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 w-full p-4 border-r border-white/5">
      <div className="px-3 py-6 mb-4">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={handleLinkClick}>
          <div className="bg-indigo-600/20 p-2 rounded-xl border border-indigo-500/30">
            <Package className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight leading-none">Inventario 1</h1>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Control Total</p>
          </div>
        </Link>
      </div>

      <div className="space-y-1.5 flex-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            onClick={handleLinkClick}
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-200",
              pathname === route.href 
                ? "text-white bg-indigo-600/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.1)]" 
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
            )}
          >
            <div className="flex items-center flex-1">
              <route.icon className={cn("h-5 w-5 mr-3 transition-colors", pathname === route.href ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
              {route.label}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-auto pt-4 space-y-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
          onClick={() => {
            handleLogout();
            handleLinkClick();
          }}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Cerrar Sesión
        </Button>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
          <p className="text-[10px] text-slate-500 text-center leading-relaxed">
            PROPIEDAD DE<br />
            <span className="text-indigo-400 font-bold tracking-widest uppercase">Moises Cuevas</span>
          </p>
        </div>
      </div>
    </div>
  );
}
