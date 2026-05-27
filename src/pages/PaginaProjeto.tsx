import { useState } from 'react';
import type { Projeto, DRELinhas, AlocacaoRecurso, Recurso } from '../types';
import { novoPeriodo, calcularDRE, MESES } from '../store';
import { formatBRL } from '../utils/format';
import FormDRE from '../components/FormDRE';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

interface Props {
  projeto: Projeto;
  recursos: Recurso[];
  onAtualizar: (projeto: Projeto) => void;
  onExcluir: () => void;
}

interface KPICard {
  label: string;
  value: number;
  sub?: string;
}

export default function PaginaProjeto({ projeto, recursos, onAtualizar, onExcluir }: Props) {
  const hoje = new Date();
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string | null>(
    projeto.periodos.length > 0 ? projeto.periodos[projeto.periodos.length - 1].id : null
  );
  const [novoMes, setNovoMes] = useState(hoje.getMonth() + 1);
  const [novoAno, setNovoAno] = useState(hoje.getFullYear());

  function adicionarPeriodo() {
    const jaExiste = projeto.periodos.some(p => p.mes === novoMes && p.ano === novoAno);
    if (jaExiste) return alert(`Período ${MESES[novoMes - 1]}/${novoAno} já existe neste projeto.`);
    const periodo = novoPeriodo(novoMes, novoAno);
    const periodos = [...projeto.periodos, periodo].sort((a, b) =>
      a.ano !== b.ano ? a.ano - b.ano : a.mes - b.mes
    );
    onAtualizar({ ...projeto, periodos });
    setPeriodoSelecionado(periodo.id);
  }

  function salvarPeriodo(id: string, linhas: DRELinhas, obs: string, alocacoes: AlocacaoRecurso[]) {
    const periodos = projeto.periodos.map(p =>
      p.id === id ? { ...p, linhas, observacoes: obs, alocacoes } : p
    );
    onAtualizar({ ...projeto, periodos });
  }

  function excluirPeriodo(id: string) {
    if (!confirm('Excluir este período?')) return;
    const periodos = projeto.periodos.filter(p => p.id !== id);
    onAtualizar({ ...projeto, periodos });
    if (periodoSelecionado === id) {
      setPeriodoSelecionado(periodos.length > 0 ? periodos[periodos.length - 1].id : null);
    }
  }

  const periodoAtual = projeto.periodos.find(p => p.id === periodoSelecionado) ?? null;

  const dadosGrafico = projeto.periodos.map(p => {
    const dre = calcularDRE(p.linhas);
    return {
      name: `${MESES[p.mes - 1].slice(0, 3)}/${String(p.ano).slice(2)}`,
      'Rec. Bruta': dre.receitaBruta,
      'ROL': dre.receitaLiquida,
      'EBITDA': dre.ebitda,
      'Lucro Líquido': dre.lucroLiquido,
    };
  });

  const ultimoDRE = projeto.periodos.length > 0
    ? calcularDRE(projeto.periodos[projeto.periodos.length - 1].linhas)
    : null;

  const kpis: KPICard[] = ultimoDRE ? [
    { label: 'Receita Bruta', value: ultimoDRE.receitaBruta },
    { label: 'ROL', value: ultimoDRE.receitaLiquida, sub: `Deduções: ${formatBRL(ultimoDRE.totalDeducoes)}` },
    { label: 'Lucro Bruto', value: ultimoDRE.lucroBruto, sub: `Margem: ${ultimoDRE.receitaLiquida > 0 ? ((ultimoDRE.lucroBruto / ultimoDRE.receitaLiquida) * 100).toFixed(1) + '%' : '—'}` },
    { label: 'EBITDA', value: ultimoDRE.ebitda, sub: `Margem: ${ultimoDRE.receitaLiquida > 0 ? ((ultimoDRE.ebitda / ultimoDRE.receitaLiquida) * 100).toFixed(1) + '%' : '—'}` },
    { label: 'Lucro Líquido', value: ultimoDRE.lucroLiquido, sub: `Margem: ${ultimoDRE.receitaLiquida > 0 ? ((ultimoDRE.lucroLiquido / ultimoDRE.receitaLiquida) * 100).toFixed(1) + '%' : '—'}` },
  ] : [];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: projeto.cor, display: 'inline-block' }} />
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1e293b' }}>{projeto.nome}</h1>
          </div>
          {projeto.descricao && (
            <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: 13 }}>{projeto.descricao}</p>
          )}
          <span style={{ fontSize: 12, color: '#94a3b8', background: '#f1f5f9', padding: '2px 10px', borderRadius: 12 }}>
            {projeto.tipo}
          </span>
        </div>
        <button
          onClick={onExcluir}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8,
            cursor: 'pointer', fontSize: 13,
          }}
        >
          <Trash2 size={14} /> Excluir
        </button>
      </div>

      {/* KPIs */}
      {kpis.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
          {kpis.map(card => (
            <div key={card.label} style={{
              background: '#fff', borderRadius: 10, padding: '14px 16px',
              border: '1px solid #e2e8f0',
            }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{card.label}</p>
              <p style={{ margin: '0 0 2px', fontSize: 17, fontWeight: 700, color: card.value >= 0 ? '#059669' : '#dc2626' }}>
                {formatBRL(card.value)}
              </p>
              {card.sub && <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{card.sub}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Gráfico de evolução */}
      {dadosGrafico.length > 1 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0', marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Evolução por Período</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `R$${(Number(v) / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatBRL(Number(v))} />
              <Legend />
              <Line type="monotone" dataKey="Rec. Bruta" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ROL" stroke="#06b6d4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="EBITDA" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Lucro Líquido" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Layout principal: lista de períodos + formulário */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>

        {/* Coluna esquerda: períodos */}
        <div>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 14, marginBottom: 12 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Adicionar Período
            </p>
            <select
              value={novoMes}
              onChange={e => setNovoMes(Number(e.target.value))}
              style={{ width: '100%', padding: '7px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, marginBottom: 6 }}
            >
              {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <input
              type="number"
              value={novoAno}
              onChange={e => setNovoAno(Number(e.target.value))}
              min={2000} max={2100}
              style={{ width: '100%', padding: '7px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, marginBottom: 8 }}
            />
            <button
              onClick={adicionarPeriodo}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px', background: '#3b82f6', color: '#fff', border: 'none',
                borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700,
              }}
            >
              <Plus size={14} /> Adicionar
            </button>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <p style={{ margin: 0, padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #f1f5f9' }}>
              Períodos ({projeto.periodos.length})
            </p>
            {projeto.periodos.length === 0 ? (
              <p style={{ padding: '12px 14px', fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>
                Nenhum período
              </p>
            ) : (
              projeto.periodos.map(p => {
                const dre = calcularDRE(p.linhas);
                const ativo = periodoSelecionado === p.id;
                const ll = dre.lucroLiquido;
                return (
                  <div
                    key={p.id}
                    style={{
                      padding: '10px 14px', cursor: 'pointer',
                      background: ativo ? '#eff6ff' : '#fff',
                      borderBottom: '1px solid #f1f5f9',
                      borderLeft: `3px solid ${ativo ? '#3b82f6' : 'transparent'}`,
                    }}
                    onClick={() => setPeriodoSelecionado(p.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: ativo ? 700 : 400, color: ativo ? '#1e293b' : '#374151' }}>
                        {MESES[p.mes - 1].slice(0, 3)}/{p.ano}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); excluirPeriodo(p.id); }}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', padding: 2 }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                      RB: {formatBRL(dre.receitaBruta)}
                    </div>
                    <div style={{ fontSize: 11, color: ll >= 0 ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', gap: 3 }}>
                      {ll >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      LL: {formatBRL(ll)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Formulário DRE */}
        <div>
          {periodoAtual ? (
            <FormDRE
              periodo={periodoAtual}
              recursos={recursos}
              nomeProjeto={projeto.nome}
              onSalvar={(linhas, obs, alocacoes) => salvarPeriodo(periodoAtual.id, linhas, obs, alocacoes)}
            />
          ) : (
            <div style={{
              background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
              padding: 60, textAlign: 'center', color: '#94a3b8',
            }}>
              <Edit2 size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: 15 }}>Adicione um período para inserir dados do DRE</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
