export interface DRELinhas {
  // ── Receitas ──────────────────────────────────────────────────────────────
  receitaConsultoria: number;
  receitaAdequacao: number;
  receitaRecorrencia: number;
  receitaRoyalties: number;
  receitaOutras: number;

  // ── Deduções ──────────────────────────────────────────────────────────────
  pis: number;
  cofins: number;
  iss: number;
  devolucoes: number;

  // ── Custo dos Serviços Prestados ──────────────────────────────────────────
  custoPessoal: number;           // Despesas com Pessoal (CLT)
  custoServicosTerc: number;      // Serviços de Terceiros PJ
  assessoriaTecnica: number;      // Assessoria Técnica
  servicosAdmGestao: number;      // Serviços Administrativos e Gestão
  custoViagens: number;           // Despesas de Viagens
  reembolsoViagens: number;       // Reembolso Despesas com Viagens
  custoSoftware: number;          // Software / Infraestrutura
  custoOutros: number;            // Outras Despesas de Custo

  // ── Despesas Comerciais ───────────────────────────────────────────────────
  comissaoVendas: number;
  comissaoRecorrencia: number;
  indenizacaoClientes: number;    // Indenização a Clientes
  contasIncobráveis: number;
  despComercialOutras: number;

  // ── Depreciação e Amortização ─────────────────────────────────────────────
  depreciacao: number;

  // ── Resultado Financeiro ──────────────────────────────────────────────────
  despesasFinanceiras: number;    // Juros e Encargos s/ Empréstimos
  variacaoCambial: number;        // Variação Cambial Passiva
  despesasBancarias: number;      // Despesas Bancárias
  iof: number;                    // Despesas com IOF
  multaMora: number;              // Multa de Mora
  receitasFinanceiras: number;

  // ── Impostos ──────────────────────────────────────────────────────────────
  irpj: number;
  csll: number;
  irpjDiferido: number;           // IRPJ Diferido
  csllDiferido: number;           // CSLL Diferido
}

export interface DRECalculado {
  // Receitas
  receitaBrutaServicos: number;
  receitaBrutaRecorrencia: number;
  receitaBrutaRoyalties: number;
  receitaBruta: number;

  // Deduções
  pis: number;
  cofins: number;
  iss: number;
  devolucoes: number;
  totalDeducoes: number;
  receitaLiquida: number;

  // Custos
  custoPessoal: number;
  custoServicosTerc: number;
  assessoriaTecnica: number;
  servicosAdmGestao: number;
  custoViagens: number;
  reembolsoViagens: number;
  custoSoftware: number;
  custoOutros: number;
  totalCustos: number;
  lucroBruto: number;

  // Despesas Comerciais
  comissaoVendas: number;
  comissaoRecorrencia: number;
  indenizacaoClientes: number;
  contasIncobráveis: number;
  despComercialOutras: number;
  totalDespesasComerciais: number;
  ebitda: number;

  // D&A
  depreciacao: number;
  ebit: number;

  // Resultado Financeiro
  despesasFinanceiras: number;
  variacaoCambial: number;
  despesasBancarias: number;
  iof: number;
  multaMora: number;
  totalDespesasFinanceiras: number;
  receitasFinanceiras: number;
  resultadoFinanceiro: number;
  lair: number;

  // Impostos
  irpj: number;
  csll: number;
  irpjDiferido: number;
  csllDiferido: number;
  totalImpostos: number;
  lucroLiquido: number;
}

// ── Recursos humanos ──────────────────────────────────────────────────────────

export type TipoRecurso = 'CLT' | 'PJ' | 'Outro';

export interface Recurso {
  id: string;
  nome: string;
  cargo: string;
  tipo: TipoRecurso;
  salarioMensal: number;
  horasContratuais: number;
  ativo: boolean;
  criadoEm: string;
}

export interface AlocacaoRecurso {
  recursoId: string;
  nomeSnapshot: string;
  cargoSnapshot: string;
  tipoSnapshot: TipoRecurso;
  valorHoraSnapshot: number;
  horas: number;
  custo: number;
}

export interface DREPeriodo {
  id: string;
  mes: number;
  ano: number;
  linhas: DRELinhas;
  alocacoes?: AlocacaoRecurso[];
  observacoes?: string;
}

export interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  tipo: string;
  cor: string;
  criadoEm: string;
  periodos: DREPeriodo[];
}

export type TipoProjeto =
  | 'Tecnologia / TI'
  | 'Industrial / Manufatura'
  | 'Serviços / Consultoria'
  | 'Varejo / Comércio'
  | 'Outro';
