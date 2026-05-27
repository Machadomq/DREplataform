import * as XLSX from 'xlsx';
import type { DRECalculado, AlocacaoRecurso } from '../types';
import { formatBRL, formatPercent } from './format';

// ── Estrutura do DRE para export ─────────────────────────────────────────────
type LinhaExport =
  | { tipo: 'grupo'; label: string }
  | { tipo: 'item'; label: string; key: keyof DRECalculado }
  | { tipo: 'subtotal'; label: string; key: keyof DRECalculado; destaque?: boolean }
  | { tipo: 'total'; label: string; key: keyof DRECalculado };

const ESTRUTURA: LinhaExport[] = [
  { tipo: 'grupo', label: 'RECEITAS' },
  { tipo: 'item', label: 'Consultoria / Treinamento', key: 'receitaBrutaServicos' },
  { tipo: 'item', label: 'Recorrência / SaaS', key: 'receitaBrutaRecorrencia' },
  { tipo: 'item', label: 'Royalties', key: 'receitaBrutaRoyalties' },
  { tipo: 'subtotal', label: 'Receita Operacional Bruta', key: 'receitaBruta' },

  { tipo: 'grupo', label: 'DEDUÇÕES DA RECEITA BRUTA' },
  { tipo: 'item', label: '(−) PIS sobre Vendas/Serviços', key: 'pis' },
  { tipo: 'item', label: '(−) COFINS sobre Vendas/Serviços', key: 'cofins' },
  { tipo: 'item', label: '(−) ISSQN sobre Serviços', key: 'iss' },
  { tipo: 'item', label: '(−) Devoluções de Serviços', key: 'devolucoes' },
  { tipo: 'subtotal', label: 'Receita Operacional Líquida (ROL)', key: 'receitaLiquida', destaque: true },

  { tipo: 'grupo', label: 'CUSTO DOS SERVIÇOS PRESTADOS' },
  { tipo: 'item', label: '(−) Despesas com Pessoal (CLT)', key: 'custoPessoal' },
  { tipo: 'item', label: '(−) Serviços de Terceiros (PJ)', key: 'custoServicosTerc' },
  { tipo: 'item', label: '(−) Assessoria Técnica', key: 'assessoriaTecnica' },
  { tipo: 'item', label: '(−) Serviços Administrativos e Gestão', key: 'servicosAdmGestao' },
  { tipo: 'item', label: '(−) Viagens e Deslocamentos', key: 'custoViagens' },
  { tipo: 'item', label: '(−) Reembolso de Viagens', key: 'reembolsoViagens' },
  { tipo: 'item', label: '(−) Software / Infraestrutura', key: 'custoSoftware' },
  { tipo: 'item', label: '(−) Outras Despesas de Custo', key: 'custoOutros' },
  { tipo: 'subtotal', label: 'Lucro Operacional Bruto', key: 'lucroBruto', destaque: true },

  { tipo: 'grupo', label: 'DESPESAS COMERCIAIS' },
  { tipo: 'item', label: '(−) Comissões sobre Vendas', key: 'comissaoVendas' },
  { tipo: 'item', label: '(−) Comissões sobre Recorrência', key: 'comissaoRecorrencia' },
  { tipo: 'item', label: '(−) Indenização a Clientes', key: 'indenizacaoClientes' },
  { tipo: 'item', label: '(−) Contas Incobráveis', key: 'contasIncobráveis' },
  { tipo: 'item', label: '(−) Outras Desp. Comerciais', key: 'despComercialOutras' },
  { tipo: 'subtotal', label: 'EBITDA', key: 'ebitda', destaque: true },

  { tipo: 'grupo', label: 'DEPRECIAÇÃO E AMORTIZAÇÃO' },
  { tipo: 'item', label: '(−) Depreciação / Amortização', key: 'depreciacao' },
  { tipo: 'subtotal', label: 'EBIT (Lucro Operacional Líquido)', key: 'ebit' },

  { tipo: 'grupo', label: 'RESULTADO FINANCEIRO' },
  { tipo: 'item', label: '(−) Juros e Encargos s/ Empréstimos', key: 'despesasFinanceiras' },
  { tipo: 'item', label: '(−) Variação Cambial Passiva', key: 'variacaoCambial' },
  { tipo: 'item', label: '(−) Despesas Bancárias', key: 'despesasBancarias' },
  { tipo: 'item', label: '(−) IOF', key: 'iof' },
  { tipo: 'item', label: '(−) Multa de Mora', key: 'multaMora' },
  { tipo: 'item', label: '(+) Receitas Financeiras', key: 'receitasFinanceiras' },
  { tipo: 'subtotal', label: 'Lucro Antes do IR (LAIR)', key: 'lair' },

  { tipo: 'grupo', label: 'IMPOSTOS SOBRE O RESULTADO' },
  { tipo: 'item', label: '(−) IRPJ', key: 'irpj' },
  { tipo: 'item', label: '(−) CSLL', key: 'csll' },
  { tipo: 'item', label: '(−) IRPJ Diferido', key: 'irpjDiferido' },
  { tipo: 'item', label: '(−) CSLL Diferido', key: 'csllDiferido' },
  { tipo: 'total', label: 'LUCRO LÍQUIDO DO EXERCÍCIO', key: 'lucroLiquido' },
];

// ── HTML Export ───────────────────────────────────────────────────────────────
export function exportarHTML(
  nomeProjeto: string,
  periodo: string,
  dre: DRECalculado,
  alocacoes: AlocacaoRecurso[],
) {
  const rol = dre.receitaLiquida;
  const corLL = dre.lucroLiquido >= 0 ? '#16a34a' : '#dc2626';

  const linhasHTML = ESTRUTURA.map(linha => {
    if (linha.tipo === 'grupo') {
      return `<tr><td colspan="3" style="background:#334155;color:#94a3b8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:7px 14px;">${linha.label}</td></tr>`;
    }
    const val = dre[linha.key] as number;
    const pct = rol > 0 ? formatPercent(val, rol) : '—';
    const isTotal = linha.tipo === 'total';
    const isDestaque = linha.tipo === 'subtotal' && linha.destaque;
    const isSubtotal = linha.tipo === 'subtotal';
    const bg = isTotal ? (dre.lucroLiquido >= 0 ? '#f0fdf4' : '#fef2f2') : isDestaque ? '#f0f9ff' : isSubtotal ? '#f8fafc' : '#fff';
    const border = isTotal ? `3px solid ${corLL}` : (isDestaque || isSubtotal) ? '2px solid #e2e8f0' : '1px solid #f1f5f9';
    const fw = (isTotal || isSubtotal) ? '700' : '400';
    const fs = isTotal ? '15px' : isSubtotal ? '13px' : '13px';
    const cor = (isTotal || isSubtotal) ? (val >= 0 ? '#059669' : '#dc2626') : '#374151';
    const prefix = isTotal ? '= ' : isSubtotal ? '= ' : '';
    return `<tr style="border-bottom:${border};background:${bg};">
      <td style="padding:7px 14px;font-size:${fs};font-weight:${fw};color:#1e293b;">${prefix}${linha.label}</td>
      <td style="padding:7px 14px;text-align:right;font-family:monospace;font-size:${fs};font-weight:${fw};color:${cor};">${formatBRL(val)}</td>
      <td style="padding:7px 14px;text-align:right;font-family:monospace;font-size:12px;color:#64748b;">${pct}</td>
    </tr>`;
  }).join('');

  const alocacoesHTML = alocacoes.length > 0 ? `
    <h3 style="margin:28px 0 10px;font-size:14px;color:#1e293b;">Alocação de Recursos — ${periodo}</h3>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <thead><tr style="background:#1e293b;">
        <th style="padding:9px 14px;text-align:left;font-size:12px;color:#94a3b8;">Recurso</th>
        <th style="padding:9px 14px;text-align:left;font-size:12px;color:#94a3b8;">Tipo</th>
        <th style="padding:9px 14px;text-align:right;font-size:12px;color:#94a3b8;">Horas</th>
        <th style="padding:9px 14px;text-align:right;font-size:12px;color:#94a3b8;">Valor/Hora</th>
        <th style="padding:9px 14px;text-align:right;font-size:12px;color:#94a3b8;">Custo</th>
      </tr></thead>
      <tbody>${alocacoes.map((a, i) => `
        <tr style="background:${i % 2 === 0 ? '#fff' : '#fafafa'};border-bottom:1px solid #f1f5f9;">
          <td style="padding:8px 14px;font-size:13px;font-weight:600;color:#1e293b;">${a.nomeSnapshot}${a.cargoSnapshot ? ` <span style="font-weight:400;color:#64748b;">— ${a.cargoSnapshot}</span>` : ''}</td>
          <td style="padding:8px 14px;font-size:12px;font-weight:700;color:#374151;">${a.tipoSnapshot}</td>
          <td style="padding:8px 14px;text-align:right;font-family:monospace;font-size:13px;">${a.horas}h</td>
          <td style="padding:8px 14px;text-align:right;font-family:monospace;font-size:13px;">${formatBRL(a.valorHoraSnapshot)}</td>
          <td style="padding:8px 14px;text-align:right;font-family:monospace;font-size:13px;font-weight:700;">${formatBRL(a.custo)}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : '';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>DRE — ${nomeProjeto} — ${periodo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #f1f5f9; padding: 32px; color: #1e293b; }
    .card { background: #fff; border-radius: 12px; padding: 28px; max-width: 860px; margin: 0 auto; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    h1 { font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
    .sub { font-size: 13px; color: #64748b; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; }
    @media print { body { background: #fff; padding: 0; } .card { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="card">
    <h1>DRE — ${nomeProjeto}</h1>
    <p class="sub">Período: ${periodo} &nbsp;·&nbsp; Gerado em: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
    <table>
      <thead>
        <tr style="background:#1e293b;">
          <th style="padding:10px 14px;text-align:left;font-size:12px;color:#94a3b8;font-weight:600;">LINHA</th>
          <th style="padding:10px 14px;text-align:right;font-size:12px;color:#94a3b8;font-weight:600;">VALOR (R$)</th>
          <th style="padding:10px 14px;text-align:right;font-size:12px;color:#94a3b8;font-weight:600;">% ROL</th>
        </tr>
      </thead>
      <tbody>${linhasHTML}</tbody>
    </table>
    ${alocacoesHTML}
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `DRE_${nomeProjeto.replace(/\s+/g, '_')}_${periodo.replace(/\s+/g, '_')}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Excel Export ──────────────────────────────────────────────────────────────
export function exportarExcel(
  nomeProjeto: string,
  periodo: string,
  dre: DRECalculado,
  alocacoes: AlocacaoRecurso[],
) {
  const wb = XLSX.utils.book_new();
  const rol = dre.receitaLiquida;

  // ── Aba DRE ──
  const dreRows: (string | number)[][] = [
    [`DRE — ${nomeProjeto} — ${periodo}`],
    [],
    ['LINHA', 'VALOR (R$)', '% ROL'],
  ];

  for (const linha of ESTRUTURA) {
    if (linha.tipo === 'grupo') {
      dreRows.push([linha.label, '', '']);
    } else {
      const val = dre[linha.key] as number;
      const pct = rol > 0 ? val / rol : 0;
      const prefix = linha.tipo === 'subtotal' || linha.tipo === 'total' ? '= ' : '';
      dreRows.push([`${prefix}${linha.label}`, val, pct]);
    }
  }

  const wsDRE = XLSX.utils.aoa_to_sheet(dreRows);

  // Larguras das colunas
  wsDRE['!cols'] = [{ wch: 50 }, { wch: 18 }, { wch: 10 }];

  // Formatar células de valor e percentual
  let rowIdx = 3; // começa na linha 4 (0-indexed = 3)
  for (const linha of ESTRUTURA) {
    if (linha.tipo !== 'grupo') {
      const cellVal = XLSX.utils.encode_cell({ r: rowIdx, c: 1 });
      const cellPct = XLSX.utils.encode_cell({ r: rowIdx, c: 2 });
      if (wsDRE[cellVal]) wsDRE[cellVal].z = 'R$ #,##0.00';
      if (wsDRE[cellPct]) wsDRE[cellPct].z = '0.00%';
    }
    rowIdx++;
  }

  XLSX.utils.book_append_sheet(wb, wsDRE, 'DRE');

  // ── Aba Alocações ──
  if (alocacoes.length > 0) {
    const alocRows: (string | number)[][] = [
      [`Alocação de Recursos — ${nomeProjeto} — ${periodo}`],
      [],
      ['Recurso', 'Cargo', 'Tipo', 'Horas', 'Valor/Hora (R$)', 'Custo (R$)'],
    ];
    for (const a of alocacoes) {
      alocRows.push([a.nomeSnapshot, a.cargoSnapshot, a.tipoSnapshot, a.horas, a.valorHoraSnapshot, a.custo]);
    }
    alocRows.push([]);
    const totalCLT = alocacoes.filter(a => a.tipoSnapshot === 'CLT').reduce((s, a) => s + a.custo, 0);
    const totalPJ = alocacoes.filter(a => a.tipoSnapshot === 'PJ').reduce((s, a) => s + a.custo, 0);
    const totalGeral = alocacoes.reduce((s, a) => s + a.custo, 0);
    if (totalCLT > 0) alocRows.push(['Total CLT — Pessoal', '', '', '', '', totalCLT]);
    if (totalPJ > 0) alocRows.push(['Total PJ — Serviços Terceiros', '', '', '', '', totalPJ]);
    alocRows.push(['TOTAL GERAL', '', '', '', '', totalGeral]);

    const wsAloc = XLSX.utils.aoa_to_sheet(alocRows);
    wsAloc['!cols'] = [{ wch: 30 }, { wch: 24 }, { wch: 8 }, { wch: 8 }, { wch: 16 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, wsAloc, 'Alocações');
  }

  const filename = `DRE_${nomeProjeto.replace(/\s+/g, '_')}_${periodo.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename);
}
