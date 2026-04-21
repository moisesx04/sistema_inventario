"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff, Package2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600)); // slight delay for feel

    if (username === "admin" && password === "admin") {
      document.cookie = "auth=admin; path=/; max-age=86400";
      toast.success("Acceso concedido. Bienvenido.");
      router.push("/dashboard");
      router.refresh();
    } else {
      toast.error("Usuario o contraseña incorrectos.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
            <Package2 className="h-6 w-6 text-indigo-300" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Inventario 1</span>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-extrabold text-white leading-tight">
            Controla tu<br />
            <span className="text-indigo-300">inventario</span><br />
            con precisión.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            Gestión de stock en tiempo real, alertas de reabastecimiento y reportes visuales para tu negocio.
          </p>
          <div className="flex items-center gap-2 text-indigo-300/80 text-sm">
            <ShieldCheck className="h-4 w-4" />
            <span>Entorno seguro y protegido</span>
          </div>
        </div>

        <div className="relative z-10 flex gap-6">
          {[
            { label: "Productos", value: "∞" },
            { label: "Respuesta", value: "<50ms" },
            { label: "Disponibilidad", value: "100%" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-16 lg:px-20 bg-slate-950">
        <div className="max-w-sm w-full mx-auto space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Package2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Inventario 1</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-white">Iniciar sesión</h2>
            <p className="text-slate-400 text-sm">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300 text-sm">
                Usuario
              </Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-sm">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-900/50 hover:shadow-indigo-900/70 disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Verificando...
                </span>
              ) : (
                "Entrar al sistema"
              )}
            </Button>
          </form>

          <p className="text-center text-slate-600 text-xs">
            Sistema de demostración — credenciales proporcionadas por el administrador.<br />
          <span className="text-slate-700">Desarrollado por <span className="text-indigo-500 font-medium">Moises Cuevas</span></span>
          </p>
        </div>
      </div>
    </div>
  );
}
