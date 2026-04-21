const { createApp, ref, computed, onMounted, watch } = Vue;

createApp({
    setup() {
        // State
        const products = ref(JSON.parse(localStorage.getItem('inventory_products')) || []);
        const activeTab = ref('dashboard');
        const isDark = ref(true);
        const isMobileMenuOpen = ref(false);
        const isModalOpen = ref(false);
        const searchQuery = ref('');
        const filterCategory = ref('all');
        const sortBy = ref('name-asc');
        
        const defaultCategories = ['Electrónica', 'Hogar', 'Oficina', 'Herramientas', 'Alimentos', 'Otros'];
        
        // Form State
        const editingId = ref(null);
        const form = ref({
            name: '',
            category: 'Electrónica',
            stock: 0,
            price: 0.00,
            minStock: 5,
            image: ''
        });

        // Computed
        const filteredProducts = computed(() => {
            let result = [...products.value];
            
            if (searchQuery.value) {
                const q = searchQuery.value.toLowerCase();
                result = result.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
            }

            if (filterCategory.value !== 'all') {
                result = result.filter(p => p.category === filterCategory.value);
            }

            // Sorting
            if (sortBy.value === 'name-asc') result.sort((a, b) => a.name.localeCompare(b.name));
            if (sortBy.value === 'name-desc') result.sort((a, b) => b.name.localeCompare(a.name));
            if (sortBy.value === 'stock-low') result.sort((a, b) => a.stock - b.stock);
            if (sortBy.value === 'stock-high') result.sort((a, b) => b.stock - a.stock);
            if (sortBy.value === 'price-high') result.sort((a, b) => b.price - a.price);

            return result;
        });

        const recentProducts = computed(() => [...products.value].reverse().slice(0, 5));
        const lowStockProducts = computed(() => products.value.filter(p => p.stock <= p.minStock));
        const totalStock = computed(() => products.value.reduce((acc, p) => acc + p.stock, 0));
        const totalValue = computed(() => products.value.reduce((acc, p) => acc + (p.price * p.stock), 0));
        const formattedTotalValue = computed(() => totalValue.value.toLocaleString('en-US', { minimumFractionDigits: 2 }));
        
        const categories = computed(() => [...new Set(products.value.map(p => p.category))]);
        
        const categoryStats = computed(() => {
            return categories.value.map(cat => {
                const catProducts = products.value.filter(p => p.category === cat);
                return {
                    name: cat,
                    count: catProducts.length,
                    totalStock: catProducts.reduce((acc, p) => acc + p.stock, 0),
                    totalValue: catProducts.reduce((acc, p) => acc + (p.price * p.stock), 0)
                };
            }).sort((a, b) => b.totalValue - a.totalValue);
        });

        // Methods
        const saveToLocal = () => {
            localStorage.setItem('inventory_products', JSON.stringify(products.value));
        };

        const openModal = (product = null) => {
            if (product) {
                editingId.value = product.id;
                form.value = { ...product };
            } else {
                editingId.value = null;
                form.value = {
                    name: '',
                    category: 'Electrónica',
                    stock: 0,
                    price: 0.00,
                    minStock: 5,
                    image: ''
                };
            }
            isModalOpen.value = true;
        };

        const closeModal = () => {
            isModalOpen.value = false;
        };

        const saveProduct = () => {
            const pData = {
                ...form.value,
                id: editingId.value || Date.now(),
                image: form.value.image || 'https://via.placeholder.com/150?text=' + encodeURIComponent(form.value.name)
            };

            if (editingId.value) {
                const idx = products.value.findIndex(p => p.id === editingId.value);
                products.value[idx] = pData;
            } else {
                products.value.push(pData);
            }

            saveToLocal();
            closeModal();
            setTimeout(() => lucide.createIcons(), 0);
        };

        const deleteProduct = (id) => {
            if (confirm('¿Deseas eliminar este producto?')) {
                products.value = products.value.filter(p => p.id !== id);
                saveToLocal();
            }
        };

        const exportCSV = () => {
            const headers = ['ID', 'Nombre', 'Categoría', 'Stock', 'Precio', 'Stock Minimo'];
            const rows = products.value.map(p => [p.id, p.name, p.category, p.stock, p.price, p.minStock]);
            
            let csvContent = "data:text/csv;charset=utf-8," 
                + headers.join(",") + "\n"
                + rows.map(e => e.join(",")).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "inventario_pro.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        // Watchers for icons
        watch([activeTab, isDark, isModalOpen], () => {
            setTimeout(() => lucide.createIcons(), 0);
        });

        onMounted(() => {
            if (products.value.length === 0) {
                products.value = [
                    { id: 1, name: 'MacBook Pro M2', category: 'Electrónica', stock: 12, price: 1999.99, minStock: 5, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop' },
                    { id: 2, name: 'Silla Ergonómica', category: 'Oficina', stock: 3, price: 299.00, minStock: 5, image: 'https://images.unsplash.com/photo-1505797149-43b007662c11?w=100&h=100&fit=crop' },
                    { id: 3, name: 'Monitor 4K LG', category: 'Electrónica', stock: 8, price: 449.50, minStock: 3, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&h=100&fit=crop' }
                ];
                saveToLocal();
            }
            lucide.createIcons();
        });

        return {
            products, activeTab, isDark, isMobileMenuOpen, isModalOpen,
            searchQuery, filterCategory, sortBy, defaultCategories,
            form, editingId,
            filteredProducts, recentProducts, lowStockProducts,
            totalStock, formattedTotalValue, categories, categoryStats,
            openModal, closeModal, saveProduct, deleteProduct, exportCSV,
            editProduct: openModal
        };
    }
}).mount('#app');
