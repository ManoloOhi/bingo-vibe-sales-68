// Serviço para consumir a API REST
const API_BASE_URL = 'https://api-bingo.iaautomation-dev.com.br/api';

class ApiService {
  private static async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  private static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    console.log(`🌐 API [${endpoint}]: Fazendo requisição...`);
    console.log(`🌐 API [${endpoint}]: Token disponível:`, !!token);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      console.log(`🌐 API [${endpoint}]: Status da resposta:`, response.status);
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`❌ API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ========================================
  // 🏥 HEALTH CHECK
  // ========================================
  static async healthCheck() {
    const response = await fetch('https://api-bingo.iaautomation-dev.com.br/health');
    if (!response.ok) throw new Error('API não disponível');
    return response.json();
  }

  // ========================================
  // 🎯 BINGOS
  // ========================================
  static async getBingos() {
    return this.request('/bingos');
  }

  static async getBingo(id: string) {
    return this.request(`/bingos/${id}`);
  }

  static async createBingo(bingoData: any) {
    return this.request('/bingos', {
      method: 'POST',
      body: JSON.stringify(bingoData),
    });
  }

  static async updateBingo(id: string, bingoData: any) {
    return this.request(`/bingos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bingoData),
    });
  }

  static async deleteBingo(id: string) {
    return this.request(`/bingos/${id}`, {
      method: 'DELETE',
    });
  }

  // ========================================
  // 👥 VENDEDORES
  // ========================================
  static async getVendedores() {
    return this.request('/vendedores');
  }

  static async createVendedor(vendedorData: any) {
    return this.request('/vendedores', {
      method: 'POST',
      body: JSON.stringify(vendedorData),
    });
  }

  static async updateVendedor(id: string, vendedorData: any) {
    return this.request(`/vendedores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vendedorData),
    });
  }

  static async deleteVendedor(id: string) {
    return this.request(`/vendedores/${id}`, {
      method: 'DELETE',
    });
  }

  static async getVendasVendedor(vendedorId: string) {
    return this.request(`/vendas/vendedor/${vendedorId}`);
  }

  static async getVendasBingo(bingoId: string) {
    return this.request(`/vendas/bingo/${bingoId}`);
  }

  // ========================================
  // 📦 PEDIDOS
  // ========================================
  static async getPedidos() {
    const pedidos = await this.request('/pedidos');
    console.log('API Response - Pedidos:', pedidos);
    return pedidos;
  }

  static async getPedido(id: string) {
    return this.request(`/pedidos/${id}`);
  }

  static async createPedido(pedidoData: any) {
    return this.request('/pedidos', {
      method: 'POST',
      body: JSON.stringify(pedidoData),
    });
  }

  static async updatePedido(id: string, pedidoData: any) {
    return this.request(`/pedidos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pedidoData),
    });
  }

  static async deletePedido(id: string) {
    return this.request(`/pedidos/${id}`, {
      method: 'DELETE',
    });
  }

  // ========================================
  // 📊 DASHBOARD & RELATÓRIOS
  // ========================================
  static async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  static async getBingoRelatorio(id: string) {
    return this.request(`/relatorio/bingo/${id}`);
  }

  static async getBingoCartelasDisponiveis(id: string) {
    return this.request(`/bingos/${id}/cartelas/disponiveis`);
  }

  static async getBingoCartelasVendidas(id: string) {
    return this.request(`/bingos/${id}/cartelas/vendidas`);
  }

  static async getBingoEstoque(id: string) {
    return this.request(`/bingos/${id}/estoque`);
  }

  // ========================================
  // 🔐 AUTENTICAÇÃO
  // ========================================
  static async login(email: string, senha: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });
  }

  static async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  static async getCurrentUser() {
    return this.request('/auth/me');
  }

  // ========================================
  // 📊 RELATÓRIO COMPLETO
  // ========================================
  static async getRelatorioCompleto() {
    return this.request('/relatorio/completo');
  }
}

export { ApiService };