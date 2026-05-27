import type { Projeto, DRELinhas, DREPeriodo, DRECalculado, Recurso } from './types';

const STORAGE_KEY = 'dre_projetos';
const RECURSOS_KEY = 'dre_recursos';

export function loadRecursos(): Recurso[] {
  try {
    const raw = localStorage.getItem(RECURSOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecursos(recursos: Recurso[]): void {
  localStorage.setItem(RECURSOS_KEY, JSON.stringify(recursos));
}

export const HORAS_MENSAIS_PADRAO = 176; // 22 dias × 8h

function normalizarLinhas(raw: Partial<DRELinhas> & Record<string, number>): DRELinhas {
  const vazio = linhasVazias();
  const legado: Partial<DRELinhas> = {
    receitaConsultoria: raw.receitaBruta ?? raw.receitaConsultoria ?? 0,
    pis: raw.pis ?? 0,
    cofins: raw.cofins ?? 0,
    iss: raw.iss ?? 0,
    devolucoes: raw.deducoes ?? raw.devolucoes ?? 0,
    custoPessoal: raw.custoPessoal ?? 0,
    custoServicosTerc: raw.custoServicosTerc ?? 0,
    assessoriaTecnica: raw.assessoriaTecnica ?? 0,
    servicosAdmGestao: raw.servicosAdmGestao ?? 0,
    custoViagens: raw.custoViagens ?? 0,
    reembolsoViagens: raw.reembolsoViagens ?? 0,
    custoSoftware: raw.custoSoftware ?? 0,
    custoOutros: raw.custoProdutos ?? raw.custoOutros ?? 0,
    comissaoVendas: raw.comissaoVendas ?? 0,
    comissaoRecorrencia: raw.comissaoRecorrencia ?? 0,
    indenizacaoClientes: raw.indenizacaoClientes ?? 0,
    depreciacao: raw.depreciacaoAmortizacao ?? raw.depreciacao ?? 0,
    despesasFinanceiras: raw.despesasFinanceiras ?? (raw.resultadoFinanceiro ?? 0) < 0 ? Math.abs(raw.resultadoFinanceiro ?? 0) : 0,
    variacaoCambial: raw.variacaoCambial ?? 0,
    despesasBancarias: raw.despesasBancarias ?? 0,
    iof: raw.iof ?? 0,
    multaMora: raw.multaMora ?? 0,
    receitasFinanceiras: raw.receitasFinanceiras ?? (raw.resultadoFinanceiro ?? 0) > 0 ? Math.abs(raw.resultadoFinanceiro ?? 0) : 0,
    irpj: raw.irpj ?? 0,
    csll: raw.csll ?? (raw.irCsll ?? 0),
    irpjDiferido: raw.irpjDiferido ?? 0,
    csllDiferido: raw.csllDiferido ?? 0,
  };
  return { ...vazio, ...legado };
}

export function loadProjetos(): Projeto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const projetos: Projeto[] = JSON.parse(raw);
    return projetos.map(p => ({
      ...p,
      periodos: p.periodos.map(per => ({
        ...per,
        linhas: normalizarLinhas(per.linhas as Partial<DRELinhas> & Record<string, number>),
      })),
    }));
  } catch {
    return [];
  }
}

export function saveProjetos(projetos: Projeto[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projetos));
}

export function gerarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function calcularDRE(linhas: DRELinhas): DRECalculado {
  // ── Receitas ──────────────────────────────────────────
  const receitaBrutaServicos = linhas.receitaConsultoria + linhas.receitaAdequacao;
  const receitaBrutaRecorrencia = linhas.receitaRecorrencia;
  const receitaBrutaRoyalties = linhas.receitaRoyalties;
  const receitaBruta =
    receitaBrutaServicos + receitaBrutaRecorrencia + receitaBrutaRoyalties + linhas.receitaOutras;

  // ── Deduções ──────────────────────────────────────────
  const totalDeducoes = -(
    Math.abs(linhas.pis) +
    Math.abs(linhas.cofins) +
    Math.abs(linhas.iss) +
    Math.abs(linhas.devolucoes)
  );

  // ── ROL ───────────────────────────────────────────────
  const receitaLiquida = receitaBruta + totalDeducoes;

  // ── Custos ────────────────────────────────────────────
  const totalCustos = -(
    Math.abs(linhas.custoPessoal) +
    Math.abs(linhas.custoServicosTerc) +
    Math.abs(linhas.assessoriaTecnica) +
    Math.abs(linhas.servicosAdmGestao) +
    Math.abs(linhas.custoViagens) +
    Math.abs(linhas.reembolsoViagens) +
    Math.abs(linhas.custoSoftware) +
    Math.abs(linhas.custoOutros)
  );

  // ── Lucro Bruto ───────────────────────────────────────
  const lucroBruto = receitaLiquida + totalCustos;

  // ── Despesas Comerciais ───────────────────────────────
  const totalDespesasComerciais = -(
    Math.abs(linhas.comissaoVendas) +
    Math.abs(linhas.comissaoRecorrencia) +
    Math.abs(linhas.indenizacaoClientes) +
    Math.abs(linhas.contasIncobráveis) +
    Math.abs(linhas.despComercialOutras)
  );

  // ── EBITDA ────────────────────────────────────────────
  const ebitda = lucroBruto + totalDespesasComerciais;

  // ── D&A ───────────────────────────────────────────────
  const depreciacao = -Math.abs(linhas.depreciacao);

  // ── EBIT ─────────────────────────────────────────────
  const ebit = ebitda + depreciacao;

  // ── Resultado Financeiro ──────────────────────────────
  const despesasFinanceiras = -Math.abs(linhas.despesasFinanceiras);
  const variacaoCambial = -Math.abs(linhas.variacaoCambial);
  const despesasBancarias = -Math.abs(linhas.despesasBancarias);
  const iof = -Math.abs(linhas.iof);
  const multaMora = -Math.abs(linhas.multaMora);
  const totalDespesasFinanceiras = despesasFinanceiras + variacaoCambial + despesasBancarias + iof + multaMora;
  const receitasFinanceiras = Math.abs(linhas.receitasFinanceiras);
  const resultadoFinanceiro = receitasFinanceiras + totalDespesasFinanceiras;

  // ── LAIR ──────────────────────────────────────────────
  const lair = ebit + resultadoFinanceiro;

  // ── Impostos ──────────────────────────────────────────
  const totalImpostos = -(
    Math.abs(linhas.irpj) +
    Math.abs(linhas.csll) +
    Math.abs(linhas.irpjDiferido) +
    Math.abs(linhas.csllDiferido)
  );

  // ── Lucro Líquido ─────────────────────────────────────
  const lucroLiquido = lair + totalImpostos;

  return {
    receitaBrutaServicos,
    receitaBrutaRecorrencia,
    receitaBrutaRoyalties,
    receitaBruta,
    pis: -Math.abs(linhas.pis),
    cofins: -Math.abs(linhas.cofins),
    iss: -Math.abs(linhas.iss),
    devolucoes: -Math.abs(linhas.devolucoes),
    totalDeducoes,
    receitaLiquida,
    custoPessoal: -Math.abs(linhas.custoPessoal),
    custoServicosTerc: -Math.abs(linhas.custoServicosTerc),
    assessoriaTecnica: -Math.abs(linhas.assessoriaTecnica),
    servicosAdmGestao: -Math.abs(linhas.servicosAdmGestao),
    custoViagens: -Math.abs(linhas.custoViagens),
    reembolsoViagens: -Math.abs(linhas.reembolsoViagens),
    custoSoftware: -Math.abs(linhas.custoSoftware),
    custoOutros: -Math.abs(linhas.custoOutros),
    totalCustos,
    lucroBruto,
    comissaoVendas: -Math.abs(linhas.comissaoVendas),
    comissaoRecorrencia: -Math.abs(linhas.comissaoRecorrencia),
    indenizacaoClientes: -Math.abs(linhas.indenizacaoClientes),
    contasIncobráveis: -Math.abs(linhas.contasIncobráveis),
    despComercialOutras: -Math.abs(linhas.despComercialOutras),
    totalDespesasComerciais,
    ebitda,
    depreciacao,
    ebit,
    despesasFinanceiras,
    variacaoCambial,
    despesasBancarias,
    iof,
    multaMora,
    totalDespesasFinanceiras,
    receitasFinanceiras,
    resultadoFinanceiro,
    lair,
    irpj: -Math.abs(linhas.irpj),
    csll: -Math.abs(linhas.csll),
    irpjDiferido: -Math.abs(linhas.irpjDiferido),
    csllDiferido: -Math.abs(linhas.csllDiferido),
    totalImpostos,
    lucroLiquido,
  };
}

export function linhasVazias(): DRELinhas {
  return {
    receitaConsultoria: 0,
    receitaAdequacao: 0,
    receitaRecorrencia: 0,
    receitaRoyalties: 0,
    receitaOutras: 0,
    pis: 0,
    cofins: 0,
    iss: 0,
    devolucoes: 0,
    custoPessoal: 0,
    custoServicosTerc: 0,
    assessoriaTecnica: 0,
    servicosAdmGestao: 0,
    custoViagens: 0,
    reembolsoViagens: 0,
    custoSoftware: 0,
    custoOutros: 0,
    comissaoVendas: 0,
    comissaoRecorrencia: 0,
    indenizacaoClientes: 0,
    contasIncobráveis: 0,
    despComercialOutras: 0,
    depreciacao: 0,
    despesasFinanceiras: 0,
    variacaoCambial: 0,
    despesasBancarias: 0,
    iof: 0,
    multaMora: 0,
    receitasFinanceiras: 0,
    irpj: 0,
    csll: 0,
    irpjDiferido: 0,
    csllDiferido: 0,
  };
}

export function novoPeriodo(mes: number, ano: number): DREPeriodo {
  return {
    id: gerarId(),
    mes,
    ano,
    linhas: linhasVazias(),
  };
}

export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const CORES_PROJETO = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
];
