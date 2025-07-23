// Exemplo de como integrar a API com o frontend React
// Service para consumir a API REST

const API_BASE_URL = 'https://api-bingo.iaautomation-dev.com.br/api';

export class ApiBingoService {
  // ========================================
  // 🎯 BINGOS
  // ========================================
  
  static async list() {
    const response = await fetch(`${API_BASE_URL}/bingos`);
    if (!response.ok) throw new Error('Erro ao buscar bingos');
    return response.json();
  }

  static async findById(id) {
    const response = await fetch(`${API_BASE_URL}/bingos/${id}`);
    if (!response.ok) throw new Error('Bingo não encontrado');
    return response.json();
  }

  static async create(bingoData) {
    const response = await fetch(`${API_BASE_URL}/bingos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bingoData)
    });
    if (!response.ok) throw new Error('Erro ao criar bingo');
    return response.json();
  }

  static async update(id, bingoData) {
    const response = await fetch(`${API_BASE_URL}/bingos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bingoData)
    });
    if (!response.ok) throw new Error('Erro ao atualizar bingo');
    return response.json();
  }

  static async delete(id) {
    const response = await fetch(`${API_BASE_URL}/bingos/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erro ao deletar bingo');
    return response.json();
  }

  // ========================================
  // 👥 VENDEDORES
  // ========================================
  
  static async listVendedores() {
    const response = await fetch(`${API_BASE_URL}/vendedores`);
    if (!response.ok) throw new Error('Erro ao buscar vendedores');
    return response.json();
  }

  static async createVendedor(vendedorData) {
    const response = await fetch(`${API_BASE_URL}/vendedores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendedorData)
    });
    if (!response.ok) throw new Error('Erro ao criar vendedor');
    return response.json();
  }

  static async updateVendedor(id, vendedorData) {
    const response = await fetch(`${API_BASE_URL}/vendedores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendedorData)
    });
    if (!response.ok) throw new Error('Erro ao atualizar vendedor');
    return response.json();
  }

  // ========================================
  // 📦 PEDIDOS
  // ========================================
  
  static async listPedidos() {
    const response = await fetch(`${API_BASE_URL}/pedidos`);
    if (!response.ok) throw new Error('Erro ao buscar pedidos');
    return response.json();
  }

  static async createPedido(pedidoData) {
    const response = await fetch(`${API_BASE_URL}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedidoData)
    });
    if (!response.ok) throw new Error('Erro ao criar pedido');
    return response.json();
  }

  static async updatePedido(id, pedidoData) {
    const response = await fetch(`${API_BASE_URL}/pedidos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedidoData)
    });
    if (!response.ok) throw new Error('Erro ao atualizar pedido');
    return response.json();
  }

  // ========================================
  // 🏥 HEALTH CHECK
  // ========================================
  
  static async healthCheck() {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    if (!response.ok) throw new Error('API não disponível');
    return response.json();
  }
}

// ========================================
// 📋 EXEMPLO DE USO NO REACT
// ========================================

/*
// Em um componente React:

import { ApiBingoService } from './api-service';
import { useState, useEffect } from 'react';

export function BingosList() {
  const [bingos, setBingos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBingos() {
      try {
        const data = await ApiBingoService.list();
        setBingos(data);
      } catch (error) {
        console.error('Erro ao carregar bingos:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadBingos();
  }, []);

  const handleCreateBingo = async (bingoData) => {
    try {
      const novoBingo = await ApiBingoService.create(bingoData);
      setBingos([...bingos, novoBingo]);
    } catch (error) {
      console.error('Erro ao criar bingo:', error);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Bingos ({bingos.length})</h1>
      {bingos.map(bingo => (
        <div key={bingo.id}>
          <h3>{bingo.nome}</h3>
          <p>Cartelas: {bingo.quantidadeCartelas}</p>
          <p>Valor: R$ {bingo.valorCartela}</p>
        </div>
      ))}
    </div>
  );
}
*/

console.log('🔗 Service para integração com API criado!');
console.log('📋 Métodos disponíveis:');
console.log('- ApiBingoService.list()');
console.log('- ApiBingoService.create(data)');
console.log('- ApiBingoService.update(id, data)');
console.log('- ApiBingoService.listVendedores()');
console.log('- ApiBingoService.createVendedor(data)');
console.log('- ApiBingoService.listPedidos()');
console.log('- ApiBingoService.healthCheck()');

export { ApiBingoService };