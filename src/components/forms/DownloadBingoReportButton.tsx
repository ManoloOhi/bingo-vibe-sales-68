import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ApiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface DownloadBingoReportButtonProps {
  bingoId: string;
  bingoNome: string;
}

export function DownloadBingoReportButton({ bingoId, bingoNome }: DownloadBingoReportButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

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
    return text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Regional country flags
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .replace(/🚨|⚠️|📊|🎯|⏰|📈/g, '')       // Specific emojis
      .replace(/[^\x00-\x7F]/g, '')           // Remove non-ASCII characters
      .trim();
  };

  const generateBingoPDF = (data: any) => {
    const pdf = new jsPDF();
    let yPosition = 20;
    const lineHeight = 6;
    const pageHeight = pdf.internal.pageSize.height;

    const checkPageBreak = (linesToAdd = 1) => {
      if (yPosition + (linesToAdd * lineHeight) > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
    };

    // Cabeçalho
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RELATORIO DO BINGO', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Bingo: ${data.bingo.nome}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Gerado em: ${data.dataGeracaoLocal}`, 20, yPosition);
    yPosition += 15;

    // Informações do Bingo
    checkPageBreak(8);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORMACOES DO BINGO', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Nome: ${data.bingo.nome}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Quantidade de Cartelas: ${data.bingo.quantidadeCartelas}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Range: ${data.bingo.rangeInicio} - ${data.bingo.rangeFim}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Valor por Cartela: ${formatCurrency(data.bingo.valorCartela)}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Data do Evento: ${formatDate(data.bingo.dataBingo)}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Status: ${data.bingo.ativo ? 'Ativo' : 'Inativo'}`, 20, yPosition);
    yPosition += 15;

    // Resumo do Estoque
    checkPageBreak(8);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RESUMO DO ESTOQUE', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total de Cartelas: ${data.estoque.total}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Disponivel: ${data.estoque.disponivel} (${data.percentuais.percentualDisponivel}%)`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Pendente: ${data.estoque.pendente} (${data.percentuais.percentualPendente}%)`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Vendido: ${data.estoque.vendido} (${data.percentuais.percentualVendido}%)`, 20, yPosition);
    yPosition += 15;

    // Resumo Financeiro
    checkPageBreak(8);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RESUMO FINANCEIRO', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Valor Total Possivel: ${formatCurrency(data.financeiro.valorTotal)}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Valor em Estoque: ${formatCurrency(data.financeiro.valorEstoque)}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Valor Pendente: ${formatCurrency(data.financeiro.valorPendente)}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Valor Arrecadado: ${formatCurrency(data.financeiro.valorArrecadado)}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Valor Medio por Cartela: ${formatCurrency(data.financeiro.valorMedioCartela)}`, 20, yPosition);
    yPosition += 15;

    // Performance dos Vendedores
    if (data.vendedores && data.vendedores.length > 0) {
      checkPageBreak(data.vendedores.length + 5);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PERFORMANCE DOS VENDEDORES', 20, yPosition);
      yPosition += 10;

      data.vendedores.forEach((vendedor: any) => {
        checkPageBreak(8);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${vendedor.nome}`, 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Email: ${vendedor.email}`, 25, yPosition);
        yPosition += lineHeight;
        pdf.text(`WhatsApp: ${vendedor.whatsapp}`, 25, yPosition);
        yPosition += lineHeight;
        pdf.text(`Total de Pedidos: ${vendedor.totalPedidos}`, 25, yPosition);
        yPosition += lineHeight;
        pdf.text(`Cartelas Retiradas: ${vendedor.cartelasRetiradas}`, 25, yPosition);
        yPosition += lineHeight;
        pdf.text(`Cartelas Vendidas: ${vendedor.cartelasVendidas}`, 25, yPosition);
        yPosition += lineHeight;
        pdf.text(`Cartelas Pendentes: ${vendedor.cartelasPendentes}`, 25, yPosition);
        yPosition += lineHeight;
        pdf.text(`Valor Vendido: ${formatCurrency(vendedor.valorVendido)}`, 25, yPosition);
        yPosition += lineHeight;
        pdf.text(`Taxa de Conversao: ${(vendedor.taxaConversao * 100).toFixed(1)}%`, 25, yPosition);
        yPosition += lineHeight;
        pdf.text(`Ultima Atividade: ${formatDate(vendedor.ultimaAtividade)}`, 25, yPosition);
        yPosition += 10;
      });
    }

    // Métricas
    if (data.metricas) {
      checkPageBreak(12);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('METRICAS E ANALISES', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Performance Geral:', 20, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total de Vendedores: ${data.metricas.performance.totalVendedores}`, 25, yPosition);
      yPosition += lineHeight;
      pdf.text(`Vendedores Ativos: ${data.metricas.performance.vendedoresAtivos}`, 25, yPosition);
      yPosition += lineHeight;
      pdf.text(`Vendedor Mais Eficiente: ${data.metricas.performance.vendedorMaisEficiente}`, 25, yPosition);
      yPosition += lineHeight;
      pdf.text(`Maior Taxa de Conversao: ${data.metricas.performance.maiorTaxaConversao}`, 25, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Distribuicao:', 20, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Media de Cartelas por Vendedor: ${data.metricas.distribuicao.mediaCartelasPorVendedor}`, 25, yPosition);
      yPosition += lineHeight;
      pdf.text(`Vendedor com Mais Pendentes: ${data.metricas.distribuicao.vendedorComMaisPendentes}`, 25, yPosition);
      yPosition += 15;
    }

    // Alertas e Observações
    if (data.alertas && data.alertas.length > 0) {
      checkPageBreak(data.alertas.length + 3);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ALERTAS', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      data.alertas.forEach((alerta: string) => {
        const cleanedAlert = cleanText(alerta);
        if (cleanedAlert.length > 0) {
          pdf.text(`• ${cleanedAlert}`, 20, yPosition);
          yPosition += lineHeight;
        }
      });
      yPosition += 10;
    }

    if (data.observacoes && data.observacoes.length > 0) {
      checkPageBreak(data.observacoes.length + 3);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('OBSERVACOES', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      data.observacoes.forEach((observacao: string) => {
        const cleanedObs = cleanText(observacao);
        if (cleanedObs.length > 0) {
          pdf.text(`• ${cleanedObs}`, 20, yPosition);
          yPosition += lineHeight;
        }
      });
      yPosition += 10;
    }

    // Resumo Final
    if (data.resumo) {
      checkPageBreak(6);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESUMO FINAL', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total de Pedidos: ${data.resumo.totalPedidos}`, 20, yPosition);
      yPosition += lineHeight;
      pdf.text(`Vendedores Participantes: ${data.resumo.vendedoresParticipantes}`, 20, yPosition);
      yPosition += lineHeight;
      pdf.text(`Status Geral: ${data.resumo.statusGeral}`, 20, yPosition);
    }

    return pdf;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      console.log('Fazendo download do relatório do bingo:', bingoId);
      // Usar ApiService que agora aponta para o endpoint correto
      const data = await ApiService.getBingoRelatorio(bingoId);
      console.log('Dados recebidos:', data);

      const pdf = generateBingoPDF(data);
      
      const fileName = `relatorio-bingo-${bingoNome.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "Relatório baixado com sucesso!",
        description: `O arquivo ${fileName} foi salvo.`,
      });
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      toast({
        title: "Erro ao baixar relatório",
        description: "Ocorreu um erro ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button 
      onClick={handleDownload} 
      disabled={isDownloading}
      variant="outline"
      size="sm"
    >
      <Download size={16} className="mr-2" />
      {isDownloading ? 'Gerando PDF...' : 'Baixar Relatório'}
    </Button>
  );
}