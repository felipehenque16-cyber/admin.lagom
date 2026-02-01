// Sistema de Banco de Dados Local (COMPARTILHADO com o site principal)
const DB = {
    // Chaves do localStorage (MESMAS do site principal)
    KEYS: {
        PRODUCTS: 'doce_lagom_products',
        ORDERS: 'doce_lagom_orders',
        CUSTOMERS: 'doce_lagom_customers',
        ADMIN_LOGGED_IN: 'doce_lagom_admin_logged_in'
    },
    
    // Produtos
    getProducts: function() {
        return JSON.parse(localStorage.getItem(this.KEYS.PRODUCTS)) || this.getDefaultProducts();
    },
    
    getDefaultProducts: function() {
        return {
            trufas: [
                {
                    id: 1,
                    name: "Trufa de Ninho e Nutella",
                    price: 5.00,
                    sizes: [{ name: "Mini", price: 3.00 }, { name: "Média", price: 5.00 }],
                    stock: 10,
                    type: "trufa"
                },
                {
                    id: 2,
                    name: "Trufa de Brigadeiro",
                    price: 5.00,
                    sizes: [{ name: "Mini", price: 3.00 }, { name: "Média", price: 5.00 }],
                    stock: 10,
                    type: "trufa"
                },
                {
                    id: 3,
                    name: "Trufa de Maracujá",
                    price: 5.00,
                    sizes: [{ name: "Mini", price: 3.00 }, { name: "Média", price: 5.00 }],
                    stock: 10,
                    type: "trufa"
                },
                {
                    id: 4,
                    name: "Trufa de Paçoca e Café",
                    price: 5.00,
                    sizes: [{ name: "Mini", price: 3.00 }, { name: "Média", price: 5.00 }],
                    stock: 10,
                    type: "trufa"
                }
            ],
            bolosPote: [
                {
                    id: 5,
                    name: "Bolo de Pote Brigadeiro",
                    price: 12.00,
                    stock: 10,
                    type: "bolo"
                },
                {
                    id: 6,
                    name: "Bolo de Pote Ninho com Nutella",
                    price: 12.00,
                    stock: 10,
                    type: "bolo"
                },
                {
                    id: 7,
                    name: "Bolo de Pote Maracujá",
                    price: 12.00,
                    stock: 10,
                    type: "bolo"
                }
            ],
            combos: [
                {
                    id: 8,
                    name: "Duo Lagom",
                    price: 20.00,
                    stock: 10,
                    type: "combo"
                },
                {
                    id: 9,
                    name: "Trio de Médias",
                    price: 15.00,
                    stock: 10,
                    type: "combo"
                },
                {
                    id: 10,
                    name: "Kit Degustação (5 Minis)",
                    price: 15.00,
                    stock: 10,
                    type: "combo"
                }
            ]
        };
    },
    
    saveProducts: function(products) {
        localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
    },
    
    updateProductStock: function(productId, newStock) {
        const products = this.getProducts();
        
        // Procurar em trufas
        let product = products.trufas.find(p => p.id === productId);
        if (product) {
            product.stock = newStock;
            this.saveProducts(products);
            return true;
        }
        
        // Procurar em bolos
        product = products.bolosPote.find(p => p.id === productId);
        if (product) {
            product.stock = newStock;
            this.saveProducts(products);
            return true;
        }
        
        // Procurar em combos
        product = products.combos.find(p => p.id === productId);
        if (product) {
            product.stock = newStock;
            this.saveProducts(products);
            return true;
        }
        
        return false;
    },
    
    // Pedidos
    getOrders: function() {
        return JSON.parse(localStorage.getItem(this.KEYS.ORDERS)) || [];
    },
    
    saveOrders: function(orders) {
        localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(orders));
    },
    
    updateOrderStatus: function(orderId, newStatus) {
        const orders = this.getOrders();
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = newStatus;
            this.saveOrders(orders);
            return true;
        }
        
        return false;
    },
    
    getOrderById: function(orderId) {
        const orders = this.getOrders();
        return orders.find(order => order.id === orderId);
    },
    
    // Clientes
    getCustomers: function() {
        return JSON.parse(localStorage.getItem(this.KEYS.CUSTOMERS)) || [];
    },
    
    // Admin
    isAdminLoggedIn: function() {
        return localStorage.getItem(this.KEYS.ADMIN_LOGGED_IN) === 'true';
    },
    
    setAdminLoggedIn: function(loggedIn) {
        localStorage.setItem(this.KEYS.ADMIN_LOGGED_IN, loggedIn.toString());
    },
    
    // Dashboard stats
    getDashboardStats: function() {
        const orders = this.getOrders();
        const products = this.getProducts();
        const allProducts = [...products.trufas, ...products.bolosPote, ...products.combos];
        
        const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const avgOrder = totalOrders > 0 ? totalSales / totalOrders : 0;
        
        // Calcular produtos mais vendidos
        const productSales = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!productSales[item.name]) {
                    productSales[item.name] = 0;
                }
                productSales[item.name] += item.quantity;
            });
        });
        
        const bestSellers = Object.entries(productSales)
            .map(([name, quantity]) => ({ name, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
        
        return {
            totalSales,
            totalOrders,
            pendingOrders,
            avgOrder,
            bestSellers,
            lowStockProducts: allProducts.filter(p => p.stock <= 3)
        };
    },
    
    // Exportar dados
    exportData: function() {
        const data = {
            products: this.getProducts(),
            orders: this.getOrders(),
            customers: this.getCustomers(),
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `doce_lagom_backup_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    },
    
    // Limpar todos os dados
    clearAllData: function() {
        if (confirm('Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita!')) {
            localStorage.removeItem(this.KEYS.PRODUCTS);
            localStorage.removeItem(this.KEYS.ORDERS);
            localStorage.removeItem(this.KEYS.CUSTOMERS);
            localStorage.setItem(this.KEYS.ADMIN_LOGGED_IN, 'false');
            return true;
        }
        return false;
    },
    
    // Repor todo o estoque
    restockAllProducts: function() {
        const products = this.getProducts();
        
        products.trufas.forEach(p => p.stock = 10);
        products.bolosPote.forEach(p => p.stock = 10);
        products.combos.forEach(p => p.stock = 10);
        
        this.saveProducts(products);
        return true;
    }
};

// Estado da aplicação (PAINEL ADMIN)
const AdminState = {
    isLoggedIn: false,
    currentOrderId: null,
    
    init: function() {
        this.isLoggedIn = DB.isAdminLoggedIn();
        
        if (this.isLoggedIn) {
            this.showDashboard();
        }
    },
    
    login: function(username, password) {
        // Credenciais padrão do admin
        const ADMIN_CREDENTIALS = {
            username: 'admin',
            password: 'lagom123'
        };
        
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            this.isLoggedIn = true;
            DB.setAdminLoggedIn(true);
            this.showDashboard();
            return true;
        }
        return false;
    },
    
    logout: function() {
        this.isLoggedIn = false;
        DB.setAdminLoggedIn(false);
        this.showLogin();
    },
    
    showLogin: function() {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    },
    
    showDashboard: function() {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        this.renderDashboard();
    },
    
    renderDashboard: function() {
        const stats = DB.getDashboardStats();
        const products = DB.getProducts();
        const allProducts = [...products.trufas, ...products.bolosPote, ...products.combos];
        const orders = DB.getOrders().slice(-10).reverse(); // Últimos 10 pedidos (mais recentes primeiro)
        
        // Atualizar estatísticas
        document.getElementById('total-sales').textContent = `R$ ${stats.totalSales.toFixed(2)}`;
        document.getElementById('total-orders').textContent = stats.totalOrders;
        document.getElementById('pending-orders').textContent = stats.pendingOrders;
        document.getElementById('avg-order').textContent = `R$ ${stats.avgOrder.toFixed(2)}`;
        
        // Renderizar estoque
        const stockList = document.getElementById('admin-stock-list');
        stockList.innerHTML = '';
        
        allProducts.forEach(product => {
            const stockItem = document.createElement('div');
            stockItem.className = 'product-item';
            stockItem.innerHTML = `
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <div class="product-details">Estoque atual: <span class="product-stock ${product.stock <= 3 ? 'stock-low' : 'stock-ok'}">${product.stock}</span></div>
                </div>
                <div class="admin-actions">
                    <button class="admin-btn btn-restock restock-product" data-id="${product.id}">
                        <i class="fas fa-redo"></i> Repor
                    </button>
                </div>
            `;
            stockList.appendChild(stockItem);
        });
        
        // Renderizar pedidos recentes
        const orderList = document.getElementById('admin-order-list');
        orderList.innerHTML = '';
        
        if (orders.length === 0) {
            orderList.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--azul-acinzentado);">Nenhum pedido encontrado</div>';
        } else {
            orders.forEach(order => {
                const orderItem = document.createElement('div');
                orderItem.className = 'order-item';
                orderItem.innerHTML = `
                    <div class="order-info">
                        <h4>Pedido #${order.id.toString().slice(-6)}</h4>
                        <div class="order-details">${order.customerName} - ${order.items.length} item(s) - R$ ${order.total.toFixed(2)}</div>
                        <div class="order-date">${new Date(order.date).toLocaleDateString('pt-BR')} ${new Date(order.date).toLocaleTimeString('pt-BR')}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="order-status status-${order.status}">${order.status === 'pending' ? 'Pendente' : order.status === 'confirmed' ? 'Confirmado' : 'Entregue'}</span>
                        <button class="admin-btn btn-update update-order-status" data-id="${order.id}" data-status="${order.status}">
                            <i class="fas fa-edit"></i> Atualizar
                        </button>
                    </div>
                `;
                orderList.appendChild(orderItem);
            });
        }
        
        // Renderizar produtos mais vendidos
        const bestSellersList = document.getElementById('admin-best-sellers');
        bestSellersList.innerHTML = '';
        
        if (stats.bestSellers.length === 0) {
            bestSellersList.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--azul-acinzentado);">Nenhuma venda registrada</div>';
        } else {
            stats.bestSellers.forEach(item => {
                const sellerItem = document.createElement('div');
                sellerItem.className = 'order-item';
                sellerItem.innerHTML = `
                    <div class="order-info">
                        <h4>${item.name}</h4>
                    </div>
                    <div>
                        <span class="order-status status-confirmed">${item.quantity} vendas</span>
                    </div>
                `;
                bestSellersList.appendChild(sellerItem);
            });
        }
        
        // Adicionar event listeners para botões de ação
        document.querySelectorAll('.restock-product').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = parseInt(this.dataset.id);
                DB.updateProductStock(productId, 10);
                showMessage('success', 'Estoque reposto com sucesso!');
                AdminState.renderDashboard();
            });
        });
        
        // Adicionar event listeners para botões de atualização de status
        document.querySelectorAll('.update-order-status').forEach(btn => {
            btn.addEventListener('click', function() {
                const orderId = this.dataset.id;
                const currentStatus = this.dataset.status;
                AdminState.openStatusModal(orderId, currentStatus);
            });
        });
    },
    
    openStatusModal: function(orderId, currentStatus) {
        this.currentOrderId = orderId;
        
        // Selecionar o status atual no modal
        const statusRadios = document.querySelectorAll('input[name="orderStatus"]');
        statusRadios.forEach(radio => {
            if (radio.value === currentStatus) {
                radio.checked = true;
                radio.closest('.status-option').classList.add('selected');
            } else {
                radio.closest('.status-option').classList.remove('selected');
            }
        });
        
        // Mostrar o modal
        document.getElementById('statusModal').style.display = 'flex';
    },
    
    closeStatusModal: function() {
        document.getElementById('statusModal').style.display = 'none';
        this.currentOrderId = null;
    },
    
    updateOrderStatus: function(newStatus) {
        if (!this.currentOrderId) return false;
        
        const orderId = typeof this.currentOrderId === 'string' ? this.currentOrderId : String(this.currentOrderId);
        const success = DB.updateOrderStatus(orderId, newStatus);
        
        if (success) {
            const order = DB.getOrderById(orderId);
            showMessage('success', `Status do pedido #${order.id.toString().slice(-6)} atualizado para: ${newStatus === 'pending' ? 'Pendente' : newStatus === 'confirmed' ? 'Confirmado' : 'Entregue'}`);
            this.renderDashboard();
        }
        
        return success;
    }
};

// Função para mostrar mensagens
function showMessage(type, text) {
    // Remover mensagem anterior se existir
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Criar nova mensagem
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    document.body.appendChild(message);
    
    // Remover após 3 segundos
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 3000);
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar estado do admin
    AdminState.init();
    
    // Login do admin
    document.getElementById('admin-login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('admin-username').value.trim();
        const password = document.getElementById('admin-password').value.trim();
        
        if (!username || !password) {
            document.getElementById('admin-error').textContent = 'Por favor, preencha todos os campos!';
            document.getElementById('admin-error').style.display = 'block';
            return;
        }
        
        if (AdminState.login(username, password)) {
            this.reset();
            document.getElementById('admin-error').style.display = 'none';
        } else {
            document.getElementById('admin-error').textContent = 'Credenciais inválidas! Use: admin / lagom123';
            document.getElementById('admin-error').style.display = 'block';
        }
    });
    
    // Logout do admin
    document.getElementById('admin-logout').addEventListener('click', function() {
        AdminState.logout();
    });
    
    // Ações do admin dashboard
    document.getElementById('btn-restock-all').addEventListener('click', function() {
        if (DB.restockAllProducts()) {
            showMessage('success', 'Todo o estoque foi reposto!');
            AdminState.renderDashboard();
        }
    });
    
    document.getElementById('btn-export-data').addEventListener('click', function() {
        DB.exportData();
        showMessage('success', 'Dados exportados com sucesso!');
    });
    
    document.getElementById('btn-clear-data').addEventListener('click', function() {
        if (DB.clearAllData()) {
            showMessage('info', 'Todos os dados foram limpos!');
            AdminState.renderDashboard();
        }
    });
    
    // Controle do modal de status
    document.getElementById('btnCancelStatus').addEventListener('click', function() {
        AdminState.closeStatusModal();
    });
    
    document.getElementById('btnSaveStatus').addEventListener('click', function() {
        const selectedStatus = document.querySelector('input[name="orderStatus"]:checked');
        if (selectedStatus) {
            AdminState.updateOrderStatus(selectedStatus.value);
            AdminState.closeStatusModal();
        } else {
            showMessage('error', 'Selecione um status para o pedido!');
        }
    });
    
    // Fechar modal ao clicar fora
    document.getElementById('statusModal').addEventListener('click', function(e) {
        if (e.target === this) {
            AdminState.closeStatusModal();
        }
    });
    
    // Estilizar opções de status no modal
    const statusOptions = document.querySelectorAll('.status-option');
    statusOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remover seleção de todas as opções
            statusOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Adicionar seleção à opção clicada
            this.classList.add('selected');
            
            // Marcar o radio button
            const radio = this.querySelector('.status-radio');
            if (radio) radio.checked = true;
        });
        
        // Garantir que o radio button seja marcado quando clicar na opção
        const radio = option.querySelector('.status-radio');
        radio.addEventListener('change', function() {
            if (this.checked) {
                statusOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            }
        });
    });
});
