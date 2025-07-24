import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { ApiService } from '@/services/apiService';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export function DownloadReportButton() {
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

  const generatePDF = (data: any) => {
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
    pdf.text(`Gerado em: ${data.dataGeracaoLocal}`, 20, yPosition);
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
    pdf.text(`Total de Usuários: ${data.resumoGeral.sistema.totalUsuarios}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Total de Bingos: ${data.resumoGeral.sistema.totalBingos}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Bingos Ativos: ${data.resumoGeral.sistema.bingosAtivos}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Total de Vendedores: ${data.resumoGeral.sistema.totalVendedores}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Vendedores Ativos: ${data.resumoGeral.sistema.vendedoresAtivos}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Total de Pedidos: ${data.resumoGeral.sistema.totalPedidos}`, 20, yPosition);
    yPosition += 10;

    // Cartelas
    checkPageBreak(6);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CARTELAS:', 20, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total: ${data.resumoGeral.cartelas.totalCartelas}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Disponíveis: ${data.resumoGeral.cartelas.cartelasDisponiveis}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Pendentes: ${data.resumoGeral.cartelas.cartelasPendentes}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Vendidas: ${data.resumoGeral.cartelas.cartelasVendidas}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Percentual Vendido: ${data.resumoGeral.cartelas.percentualVendido}%`, 30, yPosition);
    yPosition += 10;

    // Financeiro
    checkPageBreak(6);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FINANCEIRO:', 20, yPosition);
    yPosition += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Valor Total do Estoque: ${formatCurrency(data.resumoGeral.financeiro.valorTotalEstoque)}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Valor Total Pendente: ${formatCurrency(data.resumoGeral.financeiro.valorTotalPendente)}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Valor Total Arrecadado: ${formatCurrency(data.resumoGeral.financeiro.valorTotalArrecadado)}`, 30, yPosition);
    yPosition += lineHeight;
    pdf.text(`Valor Total Projetado: ${formatCurrency(data.resumoGeral.financeiro.valorTotalProjetado)}`, 30, yPosition);
    yPosition += 15;

    // Bingos
    if (data.bingos && data.bingos.length > 0) {
      checkPageBreak(3);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DETALHES DOS BINGOS', 20, yPosition);
      yPosition += 10;

      data.bingos.forEach((bingo: any, index: number) => {
        checkPageBreak(8);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${bingo.nome}`, 20, yPosition);
        yPosition += lineHeight;
        
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
        pdf.text(`Disponível: ${bingo.estoque.disponivel} | Pendente: ${bingo.estoque.pendente} | Vendido: ${bingo.estoque.vendido}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`Valor Arrecadado: ${formatCurrency(bingo.valores.valorArrecadado)}`, 30, yPosition);
        yPosition += 10;
      });
    }

    // Vendedores
    if (data.vendedores && data.vendedores.length > 0) {
      checkPageBreak(3);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PERFORMANCE DOS VENDEDORES', 20, yPosition);
      yPosition += 10;

      data.vendedores.forEach((vendedor: any, index: number) => {
        checkPageBreak(8);
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
        pdf.text(`Total de Pedidos: ${vendedor.performance.totalPedidos}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`Cartelas Vendidas: ${vendedor.performance.cartelasVendidas}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`Valor Total Vendido: ${formatCurrency(vendedor.performance.valorTotalVendido)}`, 30, yPosition);
        yPosition += lineHeight;
        pdf.text(`Taxa de Conversão: ${vendedor.performance.taxaConversao}%`, 30, yPosition);
        yPosition += 10;
      });
    }

    // Métricas
    if (data.metricas) {
      checkPageBreak(8);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MÉTRICAS E INDICADORES', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Taxa de Conversão Geral: ${data.metricas.eficiencia.taxaConversaoGeral}%`, 20, yPosition);
      yPosition += lineHeight;
      pdf.text(`Média de Cartelas por Vendedor: ${data.metricas.eficiencia.mediaCartelasPorVendedor}`, 20, yPosition);
      yPosition += lineHeight;
      pdf.text(`Vendedor Mais Eficiente: ${data.metricas.eficiencia.vendedorMaisEficiente}`, 20, yPosition);
      yPosition += lineHeight;
      pdf.text(`Bingo Mais Vendido: ${data.metricas.eficiencia.bingoMaisVendido}`, 20, yPosition);
      yPosition += lineHeight;
      pdf.text(`Valor Médio da Cartela: ${formatCurrency(data.metricas.financeiro.valorMedioCartela)}`, 20, yPosition);
      yPosition += lineHeight;
      pdf.text(`Percentual Arrecadado: ${data.metricas.financeiro.percentualArrecadado}%`, 20, yPosition);
      yPosition += 10;
    }

    // Alertas
    if (data.observacoes && data.observacoes.alertas && data.observacoes.alertas.length > 0) {
      checkPageBreak(data.observacoes.alertas.length + 3);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ALERTAS E OBSERVACOES', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      data.observacoes.alertas.forEach((alerta: string) => {
        const cleanedAlert = cleanText(alerta);
        if (cleanedAlert.length > 0) {
          pdf.text(`• ${cleanedAlert}`, 20, yPosition);
          yPosition += lineHeight;
        }
      });
    }

    return pdf;
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      const data = await ApiService.getRelatorioCompleto();
      const pdf = generatePDF(data);
      
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