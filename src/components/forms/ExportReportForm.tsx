import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, Table, Code, Loader2 } from 'lucide-react';
import { useRelatorioCompleto } from '@/hooks/useQueryData';
import { toast } from 'sonner';

interface ExportOptions {
  resumoGeral: boolean;
  bingos: boolean;
  vendedores: boolean;
  metricas: boolean;
  observacoes: boolean;
}

export default function ExportReportForm() {
  const { data: relatorio, isLoading } = useRelatorioCompleto();
  const [isOpen, setIsOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    resumoGeral: true,
    bingos: true,
    vendedores: true,
    metricas: true,
    observacoes: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  const toggleOption = (key: keyof ExportOptions) => {
    setExportOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue || 0);
  };

  const exportToPDF = async () => {
    if (!relatorio) return;
    
    setIsExporting(true);
    try {
      // Criar conteúdo HTML para PDF
      let htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Relatório Completo - Sistema Bingo</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
              .section { margin-bottom: 30px; page-break-inside: avoid; }
              .section-title { color: #2563eb; font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
              .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
              .card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #f9f9f9; }
              .card-title { font-weight: bold; margin-bottom: 10px; }
              .metric { font-size: 24px; font-weight: bold; color: #2563eb; }
              .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              .table th, .table td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; }
              .table th { background: #f3f4f6; font-weight: bold; }
              .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 6px; margin: 5px 0; }
              .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Relatório Completo - Sistema Bingo</h1>
              <p>Gerado em: ${relatorio.dataGeracaoLocal}</p>
            </div>
      `;

      if (exportOptions.resumoGeral) {
        htmlContent += `
          <div class="section">
            <h2 class="section-title">📊 Resumo Geral</h2>
            <div class="grid">
              <div class="card">
                <div class="card-title">Sistema</div>
                <p>Bingos Ativos: <span class="metric">${relatorio.resumoGeral.sistema.bingosAtivos}</span></p>
                <p>Vendedores Ativos: <span class="metric">${relatorio.resumoGeral.sistema.vendedoresAtivos}</span></p>
                <p>Pedidos Abertos: <span class="metric">${relatorio.resumoGeral.sistema.pedidosAbertos}</span></p>
              </div>
              <div class="card">
                <div class="card-title">Cartelas</div>
                <p>Total: <span class="metric">${relatorio.resumoGeral.cartelas.totalCartelas}</span></p>
                <p>Disponíveis: <span class="metric">${relatorio.resumoGeral.cartelas.cartelasDisponiveis}</span></p>
                <p>Vendidas: <span class="metric">${relatorio.resumoGeral.cartelas.cartelasVendidas}</span></p>
              </div>
              <div class="card">
                <div class="card-title">Financeiro</div>
                <p>Arrecadado: <span class="metric">${formatCurrency(relatorio.resumoGeral.financeiro.valorTotalArrecadado)}</span></p>
                <p>Projetado: <span class="metric">${formatCurrency(relatorio.resumoGeral.financeiro.valorTotalProjetado)}</span></p>
              </div>
            </div>
          </div>
        `;
      }

      if (exportOptions.bingos && relatorio.bingos.length > 0) {
        htmlContent += `
          <div class="section">
            <h2 class="section-title">🎯 Detalhes dos Bingos</h2>
            <table class="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cartelas</th>
                  <th>Valor</th>
                  <th>Disponível</th>
                  <th>Vendido</th>
                  <th>Arrecadado</th>
                </tr>
              </thead>
              <tbody>
                ${relatorio.bingos.map(bingo => `
                  <tr>
                    <td>${bingo.nome}</td>
                    <td>${bingo.quantidadeCartelas}</td>
                    <td>${formatCurrency(bingo.valorCartela)}</td>
                    <td>${bingo.estoque.disponivel}</td>
                    <td>${bingo.estoque.vendido}</td>
                    <td>${formatCurrency(bingo.valores.valorArrecadado)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      if (exportOptions.vendedores && relatorio.vendedores.length > 0) {
        htmlContent += `
          <div class="section">
            <h2 class="section-title">👥 Performance dos Vendedores</h2>
            <table class="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Pedidos</th>
                  <th>Cartelas Vendidas</th>
                  <th>Valor Vendido</th>
                  <th>Taxa Conversão</th>
                </tr>
              </thead>
              <tbody>
                ${relatorio.vendedores.map(vendedor => `
                  <tr>
                    <td>${vendedor.nome}</td>
                    <td>${vendedor.performance.totalPedidos}</td>
                    <td>${vendedor.performance.cartelasVendidas}</td>
                    <td>${formatCurrency(vendedor.performance.valorTotalVendido)}</td>
                    <td>${vendedor.performance.taxaConversao}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      if (exportOptions.metricas) {
        htmlContent += `
          <div class="section">
            <h2 class="section-title">📈 Métricas de Eficiência</h2>
            <div class="grid">
              <div class="card">
                <div class="card-title">Vendedor Mais Eficiente</div>
                <p class="metric">${relatorio.metricas.eficiencia.vendedorMaisEficiente}</p>
              </div>
              <div class="card">
                <div class="card-title">Bingo Mais Vendido</div>
                <p class="metric">${relatorio.metricas.eficiencia.bingoMaisVendido}</p>
              </div>
              <div class="card">
                <div class="card-title">Taxa Conversão Geral</div>
                <p class="metric">${relatorio.metricas.eficiencia.taxaConversaoGeral}%</p>
              </div>
            </div>
          </div>
        `;
      }

      if (exportOptions.observacoes && relatorio.observacoes.alertas.length > 0) {
        htmlContent += `
          <div class="section">
            <h2 class="section-title">⚠️ Alertas e Observações</h2>
            ${relatorio.observacoes.alertas.map(alerta => `
              <div class="alert">${alerta}</div>
            `).join('')}
          </div>
        `;
      }

      htmlContent += `
            <div class="footer">
              <p>Relatório gerado automaticamente pelo Sistema Bingo</p>
              <p>Data de geração: ${relatorio.dataGeracaoLocal}</p>
            </div>
          </body>
        </html>
      `;

      // Criar blob e download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-completo-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Relatório exportado como HTML com sucesso!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Erro ao exportar relatório');
      console.error('Erro na exportação:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    if (!relatorio) return;

    setIsExporting(true);
    try {
      const filteredData: any = {};
      
      if (exportOptions.resumoGeral) filteredData.resumoGeral = relatorio.resumoGeral;
      if (exportOptions.bingos) filteredData.bingos = relatorio.bingos;
      if (exportOptions.vendedores) filteredData.vendedores = relatorio.vendedores;
      if (exportOptions.metricas) filteredData.metricas = relatorio.metricas;
      if (exportOptions.observacoes) filteredData.observacoes = relatorio.observacoes;

      filteredData.dataGeracao = relatorio.dataGeracao;
      filteredData.dataGeracaoLocal = relatorio.dataGeracaoLocal;

      const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-completo-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Relatório exportado como JSON com sucesso!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Erro ao exportar relatório');
      console.error('Erro na exportação:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    if (!relatorio) return;

    setIsExporting(true);
    try {
      let csvContent = 'Relatório Completo - Sistema Bingo\n';
      csvContent += `Gerado em: ${relatorio.dataGeracaoLocal}\n\n`;

      if (exportOptions.bingos && relatorio.bingos.length > 0) {
        csvContent += 'BINGOS\n';
        csvContent += 'Nome,Cartelas,Valor,Disponível,Vendido,Arrecadado\n';
        relatorio.bingos.forEach(bingo => {
          csvContent += `"${bingo.nome}",${bingo.quantidadeCartelas},"${bingo.valorCartela}",${bingo.estoque.disponivel},${bingo.estoque.vendido},"${bingo.valores.valorArrecadado}"\n`;
        });
        csvContent += '\n';
      }

      if (exportOptions.vendedores && relatorio.vendedores.length > 0) {
        csvContent += 'VENDEDORES\n';
        csvContent += 'Nome,Pedidos,Cartelas Vendidas,Valor Vendido,Taxa Conversão\n';
        relatorio.vendedores.forEach(vendedor => {
          csvContent += `"${vendedor.nome}",${vendedor.performance.totalPedidos},${vendedor.performance.cartelasVendidas},"${vendedor.performance.valorTotalVendido}","${vendedor.performance.taxaConversao}%"\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-completo-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Relatório exportado como CSV com sucesso!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Erro ao exportar relatório');
      console.error('Erro na exportação:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Carregando relatório...
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório Completo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Relatório Completo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3">Seções para incluir:</h4>
            <div className="space-y-2">
              {Object.entries({
                resumoGeral: 'Resumo Geral',
                bingos: 'Detalhes dos Bingos',
                vendedores: 'Performance dos Vendedores',
                metricas: 'Métricas de Eficiência',
                observacoes: 'Alertas e Observações'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={exportOptions[key as keyof ExportOptions]}
                    onCheckedChange={() => toggleOption(key as keyof ExportOptions)}
                  />
                  <label htmlFor={key} className="text-sm">{label}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Formato de exportação:</h4>
            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={exportToPDF}
                disabled={isExporting}
                variant="outline"
                className="justify-start"
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                HTML (visualização web)
              </Button>
              
              <Button
                onClick={exportToCSV}
                disabled={isExporting}
                variant="outline"
                className="justify-start"
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Table className="mr-2 h-4 w-4" />
                )}
                CSV (planilha)
              </Button>
              
              <Button
                onClick={exportToJSON}
                disabled={isExporting}
                variant="outline"
                className="justify-start"
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Code className="mr-2 h-4 w-4" />
                )}
                JSON (dados brutos)
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}