import type { Projeto } from '../types';
import { calcularDRE, MESES } from '../store';
import { formatBRL } from '../utils/format';
import { TrendingUp, TrendingDown, FolderOpen, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

interface Props {
  projetos: Projeto[];
  onSelecionarProjeto: (id: string) => void;
}

export default function Dashboard({ projetos, onSelecionarProjeto }: Props) {
  if (projetos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 40px', color: '#94a3b8' }}>
        <FolderOpen size={56} style={{ marginBottom: 16, opacity: 0.4 }} />
        <h2 style={{ margin: '0 0 8px', color: '#64748b', fontSize: 22 }}>Nenhum projeto ainda</h2>
        <p style={{ margin: 0, fontSize: 15 }}>
          Crie seu primeiro projeto usando o botão "Novo Projeto" na barra lateral.
        </p>
      </div>
    );
  }

  const resumos = projetos.map(p => {
    const ultimo = p.periodos.length > 0 ? p.periodos[p.periodos.length - 1] : null;
    const dre = ultimo ? calcularDRE(ultimo.linhas) : null;
    const nomePeriodo = ultimo ? `${MESES[ultimo.mes - 1].slice(0, 3)}/${ultimo.ano}` : null;
    return { projeto: p, dre, nomePeriodo };
  });

  const totalReceita = resumos.reduce((s, r) => s + (r.dre?.receitaBruta ?? 0), 0);
  const totalROL = resumos.reduce((s, r) => s + (r.dre?.receitaLiquida ?? 0), 0);
  const totalEbitda = resumos.reduce((s, r) => s + (r.dre?.ebitda ?? 0), 0);
  const totalLucro = resumos.reduce((s, r) => s + (r.dre?.lucroLiquido ?? 0), 0);

  const dadosBar = resumos
    .filter(r => r.dre)
    .map(r => ({
      name: r.projeto.nome.length > 14 ? r.projeto.nome.slice(0, 14) + '…' : r.projeto.nome,
      'Rec. Bruta': r.dre!.receitaBruta,
      'ROL': r.dre!.receitaLiquida,
      'EBITDA': r.dre!.ebitda,
      'Lucro Líquido': r.dre!.lucroLiquido,
    }));

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700, color: '#1e293b' }}>
        Dashboard Geral
      </h1>

      {/* KPIs consolidados */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Receita Bruta Total', value: totalReceita, sub: 'Somatório dos últimos períodos' },
          { label: 'ROL Total', value: totalROL, sub: 'Após deduções de tributos' },
          { label: 'EBITDA Total', value: totalEbitda, sub: 'Resultado operacional' },
          { label: 'Lucro Líquido Total', value: totalLucro, sub: 'Resultado final' },
        ].map(card => (
          <div key={card.label} style={{
            background: '#fff', borderRadius: 12, padding: '18px 20px',
            border: '1px solid #e2e8f0',
          }}>
            <p style={{ margin: '0 0 6px', fontSize: 12, color: '#64748b' }}>{card.label}</p>
            <p style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: card.value >= 0 ? '#059669' : '#dc2626' }}>
              {formatBRL(card.value)}
            </p>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{card.sub}</span>
          </div>
        ))}
      </div>

      {/* Gráfico comparativo */}
      {dadosBar.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', border: '1px solid #e2e8f0', marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
            Comparativo — Último Período por Projeto
          </h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={dadosBar} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `R$${(Number(v) / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatBRL(Number(v))} />
              <Legend />
              <Bar dataKey="Rec. Bruta" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ROL" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="EBITDA" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Lucro Líquido" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cards de projetos */}
      <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Projetos</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {resumos.map(({ projeto, dre, nomePeriodo }) => (
          <div
            key={projeto.id}
            onClick={() => onSelecionarProjeto(projeto.id)}
            style={{
              background: '#fff', borderRadius: 12, padding: '18px 20px',
              border: '1px solid #e2e8f0', cursor: 'pointer',
              borderTop: `4px solid ${projeto.cor}`,
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: projeto.cor, flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{projeto.nome}</span>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 11, color: '#94a3b8' }}>{projeto.tipo}</p>

            {dre && nomePeriodo ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Receita Bruta', value: dre.receitaBruta },
                    { label: 'ROL', value: dre.receitaLiquida },
                    { label: 'EBITDA', value: dre.ebitda },
                    { label: 'Lucro Líquido', value: dre.lucroLiquido },
                  ].map(item => (
                    <div key={item.label}>
                      <p style={{ margin: '0 0 2px', fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                        {item.label}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {item.label === 'Lucro Líquido' && (
                          item.value >= 0
                            ? <TrendingUp size={12} color="#059669" />
                            : <TrendingDown size={12} color="#dc2626" />
                        )}
                        <p style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 700,
                          color: item.value >= 0 ? (item.label === 'Lucro Líquido' ? '#059669' : '#1e293b') : '#dc2626',
                        }}>
                          {formatBRL(item.value)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ margin: '10px 0 0', fontSize: 11, color: '#94a3b8' }}>
                  Último período: {nomePeriodo} · {projeto.periodos.length} período(s)
                </p>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontSize: 13 }}>
                <AlertCircle size={14} />
                Nenhum dado inserido ainda
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
