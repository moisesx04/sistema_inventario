const { useState, useEffect, useMemo, useRef } = React;

// --- Icons Helper ---
const Icon = ({ name, className = "" }) => {
    const iconRef = useRef(null);
    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, [name]);
    return <i data-lucide={name} className={className}></i>;
};

// --- Components ---

const StatCard = ({ title, value, icon, color }) => (
    <div className="glass p-6 rounded-2xl flex justify-between items-center group hover:scale-[1.02] transition-all">
        <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
            <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-white">{value}</h3>
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-inner`}>
            <Icon name={icon} className="w-7 h-7" />
        </div>
    </div>
);

const CategoryChart = ({ products }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (chartRef.current) chartRef.current.destroy();

        const categories = [...new Set(products.map(p => p.category))];
        const data = categories.map(cat => products.filter(p => p.category === cat).reduce((acc, p) => acc + p.stock, 0));

        const ctx = canvasRef.current.getContext('2d');
        chartRef.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: data,
                    backgroundColor: ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                cutout: '70%',
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Inter' } } } }
            }
        });
    }, [products]);

    return (
        <div className="glass p-6 rounded-2xl h-full flex flex-col items-center">
            <h3 className="text-lg font-bold mb-4 self-start">Distribución de Stock</h3>
            <div className="w-full max-w-[280px]">
                <canvas ref={canvasRef}></canvas>
            </div>
        </div>
    );
};

// --- Main App ---

const App = () => {
    const [products, setProducts] = useState(JSON.parse(localStorage.getItem('inventory_products')) || []);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isDark, setIsDark] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form state
    const [form, setForm] = useState({
        name: '', category: 'Electrónica', stock: 0, price: 0, minStock: 5, image: ''
    });

    useEffect(() => {
        localStorage.setItem('inventory_products', JSON.stringify(products));
        if (window.lucide) window.lucide.createIcons();
    }, [products]);

    useEffect(() => {
        document.body.classList.toggle('dark', isDark);
    }, [isDark]);

    const filteredProducts = useMemo(() => {
        let result = [...products];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
        }
        return result;
    }, [products, searchQuery]);

    const stats = useMemo(() => ({
        total: products.reduce((acc, p) => acc + p.stock, 0),
        lowStock: products.filter(p => p.stock <= p.minStock).length,
        value: products.reduce((acc, p) => acc + (p.price * p.stock), 0)
    }), [products]);

    const handleSave = (e) => {
        e.preventDefault();
        const pData = {
            ...form,
            id: editingProduct?.id || Date.now(),
            image: form.image || `https://via.placeholder.com/150?text=${encodeURIComponent(form.name)}`
        };

        if (editingProduct) {
            setProducts(products.map(p => p.id === editingProduct.id ? pData : p));
        } else {
            setProducts([...products, pData]);
        }
        setIsModalOpen(false);
    };

    const deleteProduct = (id) => {
        if (confirm('¿Eliminar producto?')) setProducts(products.filter(p => p.id !== id));
    };

    const openEdit = (p) => {
        setEditingProduct(p);
        setForm(p);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass border-r-0 transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                            <Icon name="package" className="w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">Stock<span className="text-primary-600">Pro</span></h1>
                    </div>

                    <nav className="space-y-2 flex-grow">
                        {[
                            { id: 'dashboard', icon: 'layout-dashboard', label: 'Panel' },
                            { id: 'inventory', icon: 'boxes', label: 'Inventario' },
                            { id: 'categories', icon: 'layers', label: 'Categorías' },
                        ].map(item => (
                            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                                className={`nav-item w-full ${activeTab === item.id ? 'active' : ''}`}>
                                <Icon name={item.icon} className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                                {item.id === 'inventory' && stats.lowStock > 0 && <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                            </button>
                        ))}
                    </nav>

                    <button onClick={() => setIsDark(!isDark)} className="mt-auto nav-item border border-slate-200 dark:border-slate-700">
                        <Icon name={isDark ? 'sun' : 'moon'} className="w-5 h-5" />
                        <span>{isDark ? 'Claro' : 'Oscuro'}</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 lg:ml-64 p-4 lg:p-8">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 glass rounded-xl">
                        <Icon name="menu" />
                    </button>
                    <div className="relative w-full max-w-md ml-4 lg:ml-0">
                        <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input type="text" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full glass pl-12 pr-4 py-3 rounded-2xl outline-none focus:ring-2 ring-primary-500/50 transition-all" />
                    </div>
                    <button onClick={() => { setEditingProduct(null); setForm({ name: '', category: 'Electrónica', stock: 0, price: 0, minStock: 5, image: '' }); setIsModalOpen(true); }}
                        className="btn-primary ml-4">
                        <Icon name="plus" className="w-5 h-5" />
                        <span className="hidden sm:inline">Nuevo</span>
                    </button>
                </header>

                <div className="max-w-7xl mx-auto">
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard title="Stock Total" value={stats.total} icon="box" color="bg-blue-500/10 text-blue-500" />
                                <StatCard title="Stock Bajo" value={stats.lowStock} icon="alert-triangle" color="bg-red-500/10 text-red-500" />
                                <StatCard title="Valor Total" value={`$${stats.value.toLocaleString()}`} icon="dollar-sign" color="bg-emerald-500/10 text-emerald-500" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <div className="glass p-6 rounded-3xl">
                                        <h3 className="text-lg font-bold mb-6">Productos Recientes</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="text-left text-sm text-slate-400 border-b border-slate-100 dark:border-slate-700/50">
                                                        <th className="pb-4 font-medium">Producto</th>
                                                        <th className="pb-4 font-medium">Categoría</th>
                                                        <th className="pb-4 font-medium text-right">Precio</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                                    {products.slice(-4).reverse().map(p => (
                                                        <tr key={p.id} className="group">
                                                            <td className="py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <img src={p.image} className="w-10 h-10 rounded-xl object-cover" />
                                                                    <span className="font-semibold">{p.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 text-slate-500">{p.category}</td>
                                                            <td className="py-4 text-right font-bold">${p.price}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <CategoryChart products={products} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'inventory' && (
                        <div className="glass rounded-3xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                                <h3 className="text-lg font-bold">Listado de Inventario</h3>
                                <div className="flex gap-2">
                                    <span className="text-sm text-slate-400">Total: {filteredProducts.length} productos</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50/50 dark:bg-slate-800/30">
                                        <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                                            <th className="px-6 py-4">Producto</th>
                                            <th className="px-6 py-4">Categoría</th>
                                            <th className="px-6 py-4">Stock</th>
                                            <th className="px-6 py-4">Precio</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        {filteredProducts.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                <td className="px-6 py-4 font-semibold">{p.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-full text-xs font-bold">
                                                        {p.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className={p.stock <= p.minStock ? 'text-red-500 font-bold' : ''}>{p.stock} uds</span>
                                                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1">
                                                            <div className={`h-full rounded-full ${p.stock <= p.minStock ? 'bg-red-500' : 'bg-primary-500'}`} 
                                                                 style={{ width: `${Math.min(100, (p.stock/50)*100)}%` }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-bold">${p.price}</td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button onClick={() => openEdit(p)} className="p-2 hover:bg-primary-500/10 text-primary-500 rounded-lg transition-colors"><Icon name="edit-2" className="w-4 h-4" /></button>
                                                    <button onClick={() => deleteProduct(p.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"><Icon name="trash-2" className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="glass w-full max-w-lg rounded-3xl p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">{editingProduct ? 'Editar Producto' : 'Añadir Producto'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><Icon name="x" /></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre del Producto</label>
                                <input required className="w-full glass bg-transparent px-4 py-3 rounded-xl outline-none border-none focus:ring-2 ring-primary-500/50"
                                    value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Categoría</label>
                                    <select className="w-full glass bg-transparent px-4 py-3 rounded-xl outline-none"
                                        value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                                        <option>Electrónica</option><option>Hogar</option><option>Oficina</option><option>Alimentos</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Stock Inicial</label>
                                    <input type="number" required className="w-full glass bg-transparent px-4 py-3 rounded-xl outline-none"
                                        value={form.stock} onChange={e => setForm({...form, stock: parseInt(e.target.value)})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Precio ($)</label>
                                    <input type="number" step="0.01" required className="w-full glass bg-transparent px-4 py-3 rounded-xl outline-none"
                                        value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Aviso Stock Bajo</label>
                                    <input type="number" required className="w-full glass bg-transparent px-4 py-3 rounded-xl outline-none"
                                        value={form.minStock} onChange={e => setForm({...form, minStock: parseInt(e.target.value)})} />
                                </div>
                            </div>
                            <button type="submit" className="w-full btn-primary justify-center py-4 mt-6 text-lg">
                                {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
