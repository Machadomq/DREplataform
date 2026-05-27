export interface DRELinhas {
  receitaConsultoria: number;
  receitaAdequacao: number;
  receitaRecorrencia: number;
  receitaRoyalties: number;
  receitaOutras: number;
  pis: number;
  cofins: number;
  iss: number;
  devolucoes: number;
  custoPessoal: number;
  custoServicosTerc: number;
  custoViagens: number;
  custoSoftware: number;
  custoOutros: number;
  comissaoVendas: number;
  comissaoRecorrencia: number;
  contasIncobráveis: number;
  despComercialOutras: number;
  depreciacao: number;
  despesasFinanceiras: number;
  receitasFinanceiras: number;
  irpj: number;
  csll: number;
}

export interface DRECalculado {
  receitaBrutaServicos: number;
  receitaBrutaRecorrencia: number;
  receitaBrutaRoyalties: number;
  receitaBruta: number;
  pis: number;
  cofins: number;
  iss: number;
  devolucoes: number;
  totalDeducoes: number;
  receitaLiquida: number;
  custoPessoal: number;
  custoServicosTerc: number;
  custoViagens: number;
  custoSoftware: number;
  custoOutros: number;
  totalCustos: number;
  lucroBruto: number;
  comissaoVendas: number;
  comissaoRecorrencia: number;
  contasIncobráveis: number;
  despComercialOutras: number;
  totalDespesasComerciais: number;
  ebitda: number;
  depreciacao: number;
  ebit: number;
  despesasFinanceiras: number;
  receitasFinanceiras: number;
  resultadoFinanceiro: number;
  lair: number;
  irpj: number;
  csll: number;
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
  horasContratuais: number;  // horas/mês (padrão: 176h)
  ativo: boolean;
  criadoEm: string;
}

export interface AlocacaoRecurso {
  recursoId: string;
  nomeSnapshot: string;
  cargoSnapshot: string;
  tipoSnapshot: TipoRecurso;
  valorHoraSnapshot: number; // salarioMensal / horasContratuais no momento da alocação
  horas: number;
  custo: number;             // horas × valorHoraSnapshot
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
