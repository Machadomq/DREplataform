import { useState } from 'react';
import type { Recurso, AlocacaoRecurso } from '../types';
import { formatBRL } from '../utils/format';
import { X, Clock } from 'lucide-react';

interface Props {
  recursos: Recurso[];
  alocacoesExistentes: AlocacaoRecurso[];
  onSalvar: (alocacoes: AlocacaoRecurso[]) => void;
  onFechar: () => void;
}

const COR_TIPO: Record<string, string> = { CLT: '#059669', PJ: '#7c3aed', Outro: '#0369a1' };

export default function ModalAlocacao({ recursos, alocacoesExistentes, onSalvar, onFechar }: Props) {
  const ativos = recursos.filter(r => r.ativo);

  const [horas, setHoras] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const aloc of alocacoesExistentes) {
      map[aloc.recursoId] = aloc.horas;
    }
    return map;
  });

  const alocacoes: AlocacaoRecurso[] = ativos
    .filter(r => (horas[r.id] ?? 0) > 0)
    .map(r => {
      const valorHoraSnapshot = r.horasContratuais > 0 ? r.salarioMensal / r.horasContratuais : 0;
      const h = horas[r.id];
      return {
        recursoId: r.id,
        nomeSnapshot: r.nome,
        cargoSnapshot: r.cargo,
        tipoSnapshot: r.tipo,
        valorHoraSnapshot,
        horas: h,
        custo: h * valorHoraSnapshot,
      };
    });

  const totalCLT = alocacoes.filter(a => a.tipoSnapshot === 'CLT').reduce((s, a) => s + a.custo, 0);
  const totalPJ = alocacoes.filter(a => a.tipoSnapshot === 'PJ').reduce((s, a) => s + a.custo, 0);
  const totalOutro = alocacoes.filter(a => a.tipoSnapshot === 'Outro').reduce((s, a) => s + a.custo, 0);
  const totalGeral = totalCLT + totalPJ + totalOutro;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 660, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Alocar Recursos</h3>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94a3b8' }}>
              Informe as horas apontadas por cada recurso neste período
            </p>
          </div>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {ativos.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ margin: '0 0 6px', fontSize: 15 }}>Nenhum recurso ativo cadastrado.</p>
              <p style={{ margin: 0, fontSize: 13 }}>Acesse a página de Recursos Humanos para cadastrar.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Recurso</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Valor/Hora</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b', width: 120 }}>Horas apontadas</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Custo</th>
                </tr>
              </thead>
              <tbody>
                {ativos.map((r, i) => {
                  const valorHora = r.horasContratuais > 0 ? r.salarioMensal / r.horasContratuais : 0;
                  const h = horas[r.id] ?? 0;
                  const custo = h * valorHora;
                  return (
                    <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{r.nome}</div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3 }}>
                          {r.cargo && <span style={{ fontSize: 11, color: '#94a3b8' }}>{r.cargo}</span>}
                          <span style={{ padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700, background: COR_TIPO[r.tipo] + '18', color: COR_TIPO[r.tipo] }}>
                            {r.tipo}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', fontSize: 13, fontFamily: 'monospace', color: '#64748b' }}>
                        {formatBRL(valorHora)}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                          <input
                            type="number"
                            min={0}
                            value={h || ''}
                            onChange={e => setHoras(prev => ({ ...prev, [r.id]: parseFloat(e.target.value) || 0 }))}
                            placeholder="0"
                            style={{ width: 72, padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, textAlign: 'right', outline: 'none', fontFamily: 'monospace' }}
                          />
                          <Clock size={12} color="#94a3b8" />
                        </div>
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', fontSize: 13, fontFamily: 'monospace', fontWeight: h > 0 ? 700 : 400, color: h > 0 ? '#1e293b' : '#cbd5e1' }}>
                        {h > 0 ? formatBRL(custo) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {ativos.length > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '2px solid #e2e8f0', background: '#f8fafc' }}>
            <div style={{ display: 'flex', gap: 20, marginBottom: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              {totalCLT > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 2 }}>CLT — Pessoal</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#059669', fontFamily: 'monospace' }}>{formatBRL(totalCLT)}</div>
                </div>
              )}
              {totalPJ > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 2 }}>PJ — Serviços Terceiros</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#7c3aed', fontFamily: 'monospace' }}>{formatBRL(totalPJ)}</div>
                </div>
              )}
              {totalOutro > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 2 }}>Outros</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0369a1', fontFamily: 'monospace' }}>{formatBRL(totalOutro)}</div>
                </div>
              )}
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 2 }}>Total Geral</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', fontFamily: 'monospace' }}>{formatBRL(totalGeral)}</div>
              </div>
            </div>

            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
              Os valores de Pessoal CLT e Serviços Terceiros PJ serão preenchidos automaticamente no formulário DRE.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => onSalvar(alocacoes)}
                style={{ flex: 1, padding: '10px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
              >
                Aplicar Alocações
              </button>
              <button onClick={onFechar} style={{ padding: '10px 18px', background: '#fff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
