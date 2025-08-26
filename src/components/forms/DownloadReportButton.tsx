import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface DownloadReportButtonProps {
  stats: {
    totalRecebido: number;
    valorEsperado: number;
    cartelasVendidas: number;
    vendedoresAtivos: number;
    taxaConversao: number;
  };
  vendedoresStats: Array<{
    nome: string;
    vendas: number;
    percentual: number;
  }>;
  bingosDetalhes: Array<{
    nome: string;
    valorEsperado: number;
    quantidadeCartelas: number;
  }>;
  vendasDetalhes: Array<{
    nome: string;
    totalRecebido: number;
    cartelasVendidas: number;
  }>;
  cartelasVendidasDetalhes: Array<{
    nome: string;
    cartelasVendidas: number;
  }>;
  vendedoresDetalhes: Array<{
    nome: string;
    bingos: string[];
    status: string;
  }>;
  vendedores: any[];
  pedidos: any[];
  bingos: any[];
}

export function DownloadReportButton({ 
  stats,
  vendedoresStats,
  bingosDetalhes,
  vendasDetalhes,
  cartelasVendidasDetalhes,
  vendedoresDetalhes,
  vendedores,
  pedidos,
  bingos
}: DownloadReportButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const cleanText = (text: string) => {
    // Remove emojis e caracteres especiais que podem causar problemas no PDF
    return text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Regional country flags
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .replace(/🚨|⚠️|📊|🎯/g, '')            // Specific emojis
      .replace(/[^\x00-\x7F]/g, '')           // Remove non-ASCII characters
      .trim();
  };

  const generatePDF = () => {
    const pdf = new jsPDF();
    let yPosition = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const lineHeight = 7;

    // Função para adicionar nova página se necessário
    const checkPageBreak = (linesNeeded: number = 1) => {
      if (yPosition + (linesNeeded * lineHeight) > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
    };

    // Cabeçalho
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RELATÓRIO COMPLETO BINGO', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 20, yPosition);
    yPosition += 15;

    // Resumo Geral
    checkPageBreak(8);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RESUMO GERAL', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    // Sistema
    pdf.text(`Total de Bingos: ${bingos.length}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Total de Vendedores: ${vendedores.length}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Vendedores Ativos: ${stats.vendedoresAtivos}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Total de Pedidos: ${pedidos.length}`, 20, yPosition);
    yPosition += 10;

    // Cartelas
    const totalCartelas = bingos.reduce((total, bingo) => total + bingo.quantidadeCartelas, 0);
    const cartelasPendentes = pedidos.reduce((total, p) => total + p.cartelasPendentes.length, 0);
    const cartelasRetiradas = pedidos.reduce((total, p) => total + p.cartelasRetiradas.length, 0);
    const cartelasDisponiveis = totalCartelas - cartelasPendentes - stats.cartelasVendidas;
    const percentualVendido = totalCartelas > 0 ? (stats.cartelasVendidas / totalCartelas) * 100 : 0;

    checkPageBreak(6);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CARTELAS:', 20, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total: ${totalCartelas}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Disponíveis: ${cartelasDisponiveis}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Pendentes: ${cartelasPendentes}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Vendidas: ${stats.cartelasVendidas}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Percentual Vendido: ${percentualVendido.toFixed(1)}%`, 30, yPosition);
    yPosition += 10;

    // Financeiro
    checkPageBreak(6);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FINANCEIRO:', 20, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Valor Total do Estoque: ${formatCurrency(stats.valorEsperado)}`, 30, yPosition);
    yPosition += lineHeight;
    const valorPendente = pedidos.reduce((total, p) => {
      const bingo = bingos.find(b => b.id === p.bingoId);
      return total + (p.cartelasPendentes.length * (parseFloat(bingo?.valorCartela) || 0));
    }, 0);
    pdf.text(`Valor Total Pendente: ${formatCurrency(valorPendente)}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Valor Total Arrecadado: ${formatCurrency(stats.totalRecebido)}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Valor Total Projetado: ${formatCurrency(stats.valorEsperado)}`, 30, yPosition);
    yPosition += 15;

    // Bingos
    if (bingos && bingos.length > 0) {
      checkPageBreak(3);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DETALHES DOS BINGOS', 20, yPosition);
      yPosition += 10;

      bingos.forEach((bingo: any, index: number) => {
        checkPageBreak(8);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${bingo.nome}`, 20, yPosition);
        yPosition += lineHeight;
        
        const cartelasVendidasBingo = pedidos
          .filter(p => p.bingoId === bingo.id)
          .reduce((total, p) => total + p.cartelasVendidas.length, 0);
        
        const cartelasPendentesBingo = pedidos
          .filter(p => p.bingoId === bingo.id)
          .reduce((total, p) => total + p.cartelasPendentes.length, 0);
        
        const cartelasDisponiveisBingo = bingo.quantidadeCartelas - cartelasPendentesBingo - cartelasVendidasBingo;
        const valorArrecadado = cartelasVendidasBingo * (parseFloat(bingo.valorCartela) || 0);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Quantidade de Cartelas: ${bingo.quantidadeCartelas}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`Range: ${bingo.rangeInicio} - ${bingo.rangeFim}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`Valor da Cartela: ${formatCurrency(bingo.valorCartela)}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`Data do Bingo: ${formatDate(bingo.dataBingo)}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`Disponível: ${cartelasDisponiveisBingo} | Pendente: ${cartelasPendentesBingo} | Vendido: ${cartelasVendidasBingo}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`Valor Arrecadado: ${formatCurrency(valorArrecadado)}`, 30, yPosition);
        yPosition += 10;
      });
    }

    // Vendedores
    if (vendedores && vendedores.length > 0) {
      checkPageBreak(3);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PERFORMANCE DOS VENDEDORES', 20, yPosition);
      yPosition += 10;

      vendedores.forEach((vendedor: any, index: number) => {
        checkPageBreak(8);
        const vendedorStats = vendedoresStats.find(v => v.nome === vendedor.nome);
        const pedidosVendedor = pedidos.filter(p => p.vendedorId === vendedor.id);
        const totalPedidos = pedidosVendedor.length;
        const cartelasVendidas = vendedorStats?.vendas || 0;
        const cartelasRetiradas = pedidosVendedor.reduce((total, p) => total + p.cartelasRetiradas.length, 0);
        const taxaConversao = cartelasRetiradas > 0 ? (cartelasVendidas / cartelasRetiradas) * 100 : 0;
        
        const valorTotalVendido = pedidosVendedor.reduce((total, pedido) => {
          const bingo = bingos.find(b => b.id === pedido.bingoId);
          return total + (pedido.cartelasVendidas.length * (parseFloat(bingo?.valorCartela) || 0));
        }, 0);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${vendedor.nome}`, 20, yPosition);
        yPosition += lineHeight;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Email: ${vendedor.email}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`WhatsApp: ${vendedor.whatsapp}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`Total de Pedidos: ${totalPedidos}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`Cartelas Vendidas: ${cartelasVendidas}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`Valor Total Vendido: ${formatCurrency(valorTotalVendido)}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`Taxa de Conversão: ${taxaConversao.toFixed(1)}%`, 30, yPosition);
        yPosition += 10;
      });
    }

    // Métricas
    checkPageBreak(8);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MÉTRICAS E INDICADORES', 20, yPosition);
    yPosition += 10;

    const mediaCartelasPorVendedor = vendedores.length > 0 ? stats.cartelasVendidas / vendedores.length : 0;
    const vendedorMaisEficiente = vendedoresStats.length > 0 ? vendedoresStats[0].nome : 'N/A';
    const bingoMaisVendido = vendasDetalhes.length > 0 
      ? vendasDetalhes.reduce((prev, current) => (prev.cartelasVendidas > current.cartelasVendidas) ? prev : current).nome 
      : 'N/A';
    const valorMedioCartela = stats.cartelasVendidas > 0 ? stats.totalRecebido / stats.cartelasVendidas : 0;
    const percentualArrecadado = stats.valorEsperado > 0 ? (stats.totalRecebido / stats.valorEsperado) * 100 : 0;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Taxa de Conversão Geral: ${stats.taxaConversao}%`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Média de Cartelas por Vendedor: ${mediaCartelasPorVendedor.toFixed(1)}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Vendedor Mais Eficiente: ${vendedorMaisEficiente}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Bingo Mais Vendido: ${bingoMaisVendido}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Valor Médio da Cartela: ${formatCurrency(valorMedioCartela)}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Percentual Arrecadado: ${percentualArrecadado.toFixed(1)}%`, 20, yPosition);
    yPosition += 10;

    // Resumo de Vendas por Vendedor
    if (vendedoresStats.length > 0) {
      checkPageBreak(vendedoresStats.length + 3);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESUMO DE VENDAS POR VENDEDOR', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      vendedoresStats.forEach((vendedor) => {
        pdf.text(`• ${vendedor.nome}: ${vendedor.vendas} cartelas (${vendedor.percentual.toFixed(1)}%)`, 20, yPosition);
        yPosition += lineHeight;
      });
    }

    return pdf;
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      const pdf = generatePDF();
      
      const fileName = `relatorio-completo-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success('Relatório baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      toast.error('Erro ao baixar o relatório. Tente novamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button 
      onClick={handleDownload} 
      disabled={isDownloading}
      className="w-full sm:w-auto"
    >
      {isDownloading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Baixar Relatório Completo
        </>
      )}
    </Button>
  );
}