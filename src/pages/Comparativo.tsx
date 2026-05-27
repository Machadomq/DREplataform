import type { Projeto } from '../types';
import { calcularDRE, MESES } from '../store';
import { formatBRL, formatPercent } from '../utils/format';

interface Props {
  projetos: Projeto[];
}

interface LinhaTabela {
  label: string;
  key: string;
  tipo: 'input' | 'subtotal' | 'destaque' | 'grupo';
}

const LINHAS: LinhaTabela[] = [
  { label: 'RECEITAS', key: '', tipo: 'grupo' },
  { label: 'Consultoria / Treinamento', key: 'receitaBrutaServicos', tipo: 'input' },
  { label: 'Recorrência / SaaS', key: 'receitaBrutaRecorrencia', tipo: 'input' },
  { label: 'Royalties', key: 'receitaBrutaRoyalties', tipo: 'input' },
  { label: '= Receita Operacional Bruta', key: 'receitaBruta', tipo: 'subtotal' },

  { label: 'DEDUÇÕES', key: '', tipo: 'grupo' },
  { label: '(−) PIS', key: 'pis', tipo: 'input' },
  { label: '(−) COFINS', key: 'cofins', tipo: 'input' },
  { label: '(−) ISSQN', key: 'iss', tipo: 'input' },
  { label: '(−) Devoluções', key: 'devolucoes', tipo: 'input' },
  { label: '= Receita Operacional Líquida (ROL)', key: 'receitaLiquida', tipo: 'destaque' },

  { label: 'CUSTOS DOS SERVIÇOS PRESTADOS', key: '', tipo: 'grupo' },
  { label: '(−) Pessoal CLT', key: 'custoPessoal', tipo: 'input' },
  { label: '(−) Serviços Terceiros PJ', key: 'custoServicosTerc', tipo: 'input' },
  { label: '(−) Assessoria Técnica', key: 'assessoriaTecnica', tipo: 'input' },
  { label: '(−) Serviços Adm. e Gestão', key: 'servicosAdmGestao', tipo: 'input' },
  { label: '(−) Viagens e Deslocamentos', key: 'custoViagens', tipo: 'input' },
  { label: '(−) Reembolso de Viagens', key: 'reembolsoViagens', tipo: 'input' },
  { label: '(−) Software / Infra', key: 'custoSoftware', tipo: 'input' },
  { label: '(−) Outros Custos', key: 'custoOutros', tipo: 'input' },
  { label: '= Lucro Operacional Bruto', key: 'lucroBruto', tipo: 'destaque' },

  { label: 'DESPESAS COMERCIAIS', key: '', tipo: 'grupo' },
  { label: '(−) Comissão Vendas', key: 'comissaoVendas', tipo: 'input' },
  { label: '(−) Comissão Recorrência', key: 'comissaoRecorrencia', tipo: 'input' },
  { label: '(−) Indenização a Clientes', key: 'indenizacaoClientes', tipo: 'input' },
  { label: '(−) Contas Incobráveis', key: 'contasIncobráveis', tipo: 'input' },
  { label: '(−) Outras Desp. Comerciais', key: 'despComercialOutras', tipo: 'input' },
  { label: '= EBITDA', key: 'ebitda', tipo: 'destaque' },

  { label: 'DEPRECIAÇÃO / FINANCEIRO', key: '', tipo: 'grupo' },
  { label: '(−) Depreciação e Amortização', key: 'depreciacao', tipo: 'input' },
  { label: '= EBIT', key: 'ebit', tipo: 'subtotal' },
  { label: '(−) Juros e Encargos s/ Empréstimos', key: 'despesasFinanceiras', tipo: 'input' },
  { label: '(−) Variação Cambial Passiva', key: 'variacaoCambial', tipo: 'input' },
  { label: '(−) Despesas Bancárias', key: 'despesasBancarias', tipo: 'input' },
  { label: '(−) IOF', key: 'iof', tipo: 'input' },
  { label: '(−) Multa de Mora', key: 'multaMora', tipo: 'input' },
  { label: '(+) Receitas Financeiras', key: 'receitasFinanceiras', tipo: 'input' },
  { label: '= Resultado Financeiro', key: 'resultadoFinanceiro', tipo: 'subtotal' },
  { label: '= Lucro Antes do IR (LAIR)', key: 'lair', tipo: 'subtotal' },

  { label: 'IMPOSTOS', key: '', tipo: 'grupo' },
  { label: '(−) IRPJ', key: 'irpj', tipo: 'input' },
  { label: '(−) CSLL', key: 'csll', tipo: 'input' },
  { label: '(−) IRPJ Diferido', key: 'irpjDiferido', tipo: 'input' },
  { label: '(−) CSLL Diferido', key: 'csllDiferido', tipo: 'input' },
  { label: '= LUCRO LÍQUIDO DO EXERCÍCIO', key: 'lucroLiquido', tipo: 'destaque' },
];

export default function Comparativo({ projetos }: Props) {
  if (projetos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
        <p style={{ fontSize: 16 }}>Nenhum projeto para comparar.</p>
      </div>
    );
  }

  const colunas = projetos.flatMap(p =>
    p.periodos.map(per => ({
      projeto: p,
      periodo: per,
      dre: calcularDRE(per.linhas),
      label: `${p.nome} — ${MESES[per.mes - 1].slice(0, 3)}/${per.ano}`,
    }))
  );

  if (colunas.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
        <p style={{ fontSize: 16 }}>Adicione períodos aos seus projetos para visualizar o comparativo.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700, color: '#1e293b' }}>
        Comparativo entre Projetos
      </h1>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: '100%' }}>
          <thead>
            <tr style={{ background: '#1e293b' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#f1f5f9', minWidth: 240, whiteSpace: 'nowrap' }}>
                Indicador
              </th>
              {colunas.map((col, i) => (
                <th key={i} style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#f1f5f9', minWidth: 170, whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.projeto.cor, flexShrink: 0 }} />
                    {col.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LINHAS.map((linha, li) => {
              if (linha.tipo === 'grupo') {
                return (
                  <tr key={li}>
                    <td
                      colSpan={colunas.length + 1}
                      style={{
                        padding: '8px 16px',
                        background: '#334155',
                        color: '#94a3b8',
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                      }}
                    >
                      {linha.label}
                    </td>
                  </tr>
                );
              }

              const isDestaque = linha.tipo === 'destaque';
              const isSubtotal = linha.tipo === 'subtotal';

              return (
                <tr
                  key={li}
                  style={{
                    background: isDestaque ? '#f0f9ff' : isSubtotal ? '#f8fafc' : li % 2 === 0 ? '#fff' : '#fafafa',
                    borderBottom: (isDestaque || isSubtotal) ? '2px solid #e2e8f0' : '1px solid #f1f5f9',
                  }}
                >
                  <td style={{
                    padding: '9px 16px',
                    fontSize: isDestaque ? 14 : 13,
                    fontWeight: (isDestaque || isSubtotal) ? 700 : 400,
                    color: (isDestaque || isSubtotal) ? '#1e293b' : '#374151',
                    whiteSpace: 'nowrap',
                  }}>
                    {linha.label}
                  </td>
                  {colunas.map((col, ci) => {
                    const dreMap = col.dre as unknown as Record<string, number>;
                    const val = dreMap[linha.key] ?? 0;
                    const rol = col.dre.receitaLiquida;
                    return (
                      <td key={ci} style={{
                        padding: '9px 16px',
                        textAlign: 'right',
                        fontSize: isDestaque ? 14 : 13,
                        fontWeight: (isDestaque || isSubtotal) ? 700 : 400,
                        fontFamily: 'monospace',
                        color: (isDestaque || isSubtotal) ? (val >= 0 ? '#059669' : '#dc2626') : '#374151',
                      }}>
                        {formatBRL(val)}
                        {isDestaque && linha.key === 'lucroLiquido' && (
                          <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'system-ui' }}>
                            {formatPercent(val, rol)} marg.
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
