// --- Types ---
interface Product {
    id: number;
    name: string;
    category: string;
    stock: number;
    price: number;
    minStock: number;
    image: string;
}

const { useState, useEffect, useMemo, useRef } = React;

// --- Icons Helper ---
const Icon = ({ name, className = "" }: { name: string; className?: string }) => {
    const iconRef = useRef(null);
    useEffect(() => {
        if (window.lucide) window.lucide.createIcons();
    }, [name]);
    return <i data-lucide={name} className={className}></i>;
};

// --- Components ---

const StatCardX = ({ title, value, icon, color, trend }: { title: string; value: string | number; icon: string; color: string; trend?: string }) => (
    <div className="stat-card-v2">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${color}`}>
                <Icon name={icon} className="w-6 h-6" />
            </div>
            {trend && <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">{trend}</span>}
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-wide uppercase">{title}</p>
        <h3 className="text-3xl font-extrabold mt-1 text-slate-800 dark:text-white">{value}</h3>
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon name={icon} className="w-24 h-24" />
        </div>
    </div>
);

const InventoryChartX = ({ products }: { products: Product[] }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (chartRef.current) chartRef.current.destroy();
        const categories = [...new Set(products.map(p => p.category))];
        const data = categories.map(cat => products.filter(p => p.category === cat).reduce((acc, p) => acc + p.stock, 0));

        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            chartRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: categories,
                    datasets: [{
                        label: 'Stock por Categoría',
                        data: data,
                        backgroundColor: '#7c3aed',
                        borderRadius: 8,
                        barThickness: 20
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false }, ticks: { color: '#94a3b8' } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }
    }, [products]);

    return (
        <div className="glass-panel p-8 rounded-[2rem] h-[350px]">
            <h3 className="text-xl font-bold mb-6">Distribución de Mercancía</h3>
            <div className="h-[230px]">
                <canvas ref={canvasRef}></canvas>
            </div>
        </div>
    );
};

// --- App ---

const App = () => {
    const [products, setProducts] = useState<Product[]>(JSON.parse(localStorage.getItem('inventory_products') || '[]'));
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isDark, setIsDark] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form
    const [form, setForm] = useState<Omit<Product, 'id'>>({
        name: '', category: 'Electrónica', stock: 0, price: 0, minStock: 5, image: ''
    });

    useEffect(() => {
        localStorage.setItem('inventory_products', JSON.stringify(products));
        if (window.lucide) window.lucide.createIcons();
    }, [products]);

    const stats = useMemo(() => ({
        total: products.reduce((acc, p) => acc + p.stock, 0),
        lowStock: products.filter(p => p.stock <= p.minStock).length,
        value: products.reduce((acc, p) => acc + (p.price * p.stock), 0)
    }), [products]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const pData = {
            ...form,
            id: editingProduct?.id || Date.now(),
            image: form.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=7c3aed&color=fff`
        };

        if (editingProduct) {
            setProducts(products.map(p => p.id === editingProduct.id ? pData : p));
        } else {
            setProducts([...products, pData]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-brand-950">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-72 p-6 z-50 hidden lg:block">
                <div className="glass-panel h-full rounded-[2.5rem] p-8 flex flex-col">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-12 h-12 bg-gradient-to-tr from-brand-600 to-accent-violet rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-600/30">
                            <Icon name="zap" className="w-7 h-7" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight">Vortex<span className="text-brand-500">Stock</span></h1>
                    </div>

                    <nav className="space-y-3 flex-grow">
                        {[
                            { id: 'dashboard', icon: 'layout-grid', label: 'Dashboard' },
                            { id: 'inventory', icon: 'database', label: 'Inventario' },
                            { id: 'categories', icon: 'pie-chart', label: 'Análisis' },
                        ].map(item => (
                            <button key={item.id} onClick={() => setActiveTab(item.id)}
                                className={`sidebar-item w-full ${activeTab === item.id ? 'active' : ''}`}>
                                <Icon name={item.icon} className="w-5 h-5" />
                                <span className="font-bold text-sm uppercase tracking-widest">{item.label}</span>
                                {item.id === 'inventory' && stats.lowStock > 0 && 
                                    <span className="ml-auto bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ring-4 ring-rose-500/20">{stats.lowStock}</span>}
                            </button>
                        ))}
                    </nav>

                    <button onClick={() => setIsDark(!isDark)} className="sidebar-item border-2 border-slate-100 dark:border-white/5 mt-auto">
                        <Icon name={isDark ? 'sun' : 'moon'} className="w-5 h-5" />
                        <span className="font-bold uppercase tracking-widest">{isDark ? 'Claro' : 'Oscuro'}</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 lg:ml-72 p-8 lg:p-12">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-4xl font-black mb-2">Bienvenido, Moises</h2>
                        <p className="text-slate-500 font-medium">Gestiona tu almacén con precisión milimétrica.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input type="text" placeholder="Buscar producto..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                className="glass-panel pl-12 pr-6 py-4 rounded-2xl w-64 outline-none focus:ring-2 ring-brand-500/30 transition-all border-none" />
                        </div>
                        <button onClick={() => { setEditingProduct(null); setForm({ name: '', category: 'Electrónica', stock: 0, price: 0, minStock: 5, image: '' }); setIsModalOpen(true); }}
                            className="btn-action">
                            <Icon name="plus-circle" className="w-5 h-5" />
                            <span>CREAR</span>
                        </button>
                    </div>
                </header>

                <div className="space-y-10">
                    {activeTab === 'dashboard' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <StatCardX title="Unidades Totales" value={stats.total} icon="box" color="bg-brand-500/10 text-brand-500" trend="+12%" />
                                <StatCardX title="Alerta Crítica" value={stats.lowStock} icon="alert-octagon" color="bg-rose-500/10 text-rose-500" trend="Revisar" />
                                <StatCardX title="Capital Activo" value={`$${stats.value.toLocaleString()}`} icon="trending-up" color="bg-emerald-500/10 text-emerald-500" trend="+5.4k" />
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                <InventoryChartX products={products} />
                                <div className="glass-panel p-8 rounded-[2rem]">
                                    <h3 className="text-xl font-bold mb-6">Acciones Rápidas</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button className="p-6 rounded-3xl bg-brand-500/5 hover:bg-brand-500/10 transition-colors text-left group">
                                            <Icon name="download" className="text-brand-500 mb-2 group-hover:scale-110 transition-transform" />
                                            <p className="font-bold text-sm">Exportar Informe</p>
                                        </button>
                                        <button className="p-6 rounded-3xl bg-rose-500/5 hover:bg-rose-500/10 transition-colors text-left group">
                                            <Icon name="trash-2" className="text-rose-500 mb-2 group-hover:scale-110 transition-transform" />
                                            <p className="font-bold text-sm">Vaciar Papelera</p>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'inventory' && (
                        <div className="glass-panel rounded-[2.5rem] overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 dark:bg-white/5 border-b border-white/5">
                                    <tr className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                                        <th className="px-8 py-6">Producto</th>
                                        <th className="px-8 py-6">Estatus</th>
                                        <th className="px-8 py-6 text-center">Stock</th>
                                        <th className="px-8 py-6">Precio</th>
                                        <th className="px-8 py-6 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                                        <tr key={p.id} className="hover:bg-brand-500/5 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <img src={p.image} className="w-12 h-12 rounded-2xl shadow-lg shadow-brand-500/10" />
                                                    <div>
                                                        <p className="font-bold text-lg">{p.name}</p>
                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{p.category}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${p.stock <= p.minStock ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                    {p.stock <= p.minStock ? 'ALERTA STOCK' : 'SALUDABLE'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col items-center">
                                                    <span className="font-black text-xl">{p.stock}</span>
                                                    <div className="w-20 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full mt-2 overflow-hidden">
                                                        <div className={`h-full ${p.stock <= p.minStock ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (p.stock/20)*100)}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-black text-lg">${p.price.toLocaleString()}</td>
                                            <td className="px-8 py-6 text-right">
                                                <button onClick={() => { setEditingProduct(p); setForm(p); setIsModalOpen(true); }} className="p-3 hover:bg-brand-500/10 rounded-2xl text-brand-500 transition-all"><Icon name="edit-3" className="w-5 h-5" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal - X Edition */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-950/80 backdrop-blur-md">
                    <div className="glass-panel w-full max-w-xl rounded-[3rem] p-10 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black tracking-tight">{editingProduct ? 'Editar Nexo' : 'Nuevo Producto'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-colors"><Icon name="x" /></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Identificador del Producto</label>
                                <input required className="w-full bg-white/5 border border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-2 ring-brand-500/50 text-lg font-bold"
                                    value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Categoría</label>
                                    <select className="w-full bg-white/5 border border-white/5 px-6 py-4 rounded-2xl outline-none font-bold appearance-none"
                                        value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                                        <option>Electrónica</option><option>Hogar</option><option>Oficina</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Existencias</label>
                                    <input type="number" required className="w-full bg-white/5 border border-white/5 px-6 py-4 rounded-2xl outline-none font-bold"
                                        value={form.stock} onChange={e => setForm({...form, stock: parseInt(e.target.value)})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Costo Unitario ($)</label>
                                    <input type="number" step="0.01" required className="w-full bg-white/5 border border-white/5 px-6 py-4 rounded-2xl outline-none font-bold"
                                        value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Umbral Crítico</label>
                                    <input type="number" required className="w-full bg-white/5 border border-white/5 px-6 py-4 rounded-2xl outline-none font-bold"
                                        value={form.minStock} onChange={e => setForm({...form, minStock: parseInt(e.target.value)})} />
                                </div>
                            </div>
                            <button type="submit" className="w-full btn-action justify-center py-5 mt-4 text-xl tracking-tighter">
                                {editingProduct ? 'SINCRONIZAR CAMBIOS' : 'ESTABLECER NEXO'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = (ReactDOM as any).createRoot(rootElement);
    root.render(<App />);
}
