import { useState } from 'react';
import type { Recurso, TipoRecurso } from '../types';
import { gerarId, HORAS_MENSAIS_PADRAO } from '../store';
import { formatBRL } from '../utils/format';
import { Plus, Edit2, Trash2, UserCheck, UserX } from 'lucide-react';

interface Props {
  recursos: Recurso[];
  onChange: (recursos: Recurso[]) => void;
}

const TIPOS: TipoRecurso[] = ['CLT', 'PJ', 'Outro'];

const COR_TIPO: Record<TipoRecurso, string> = {
  CLT: '#059669',
  PJ: '#7c3aed',
  Outro: '#0369a1',
};

function formVazio(): Omit<Recurso, 'id' | 'criadoEm'> {
  return { nome: '', cargo: '', tipo: 'CLT', salarioMensal: 0, horasContratuais: HORAS_MENSAIS_PADRAO, ativo: true };
}

export default function PaginaRecursos({ recursos, onChange }: Props) {
  const [form, setForm] = useState(formVazio());
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  function iniciarNovo() {
    setForm(formVazio());
    setEditandoId(null);
    setMostrarForm(true);
  }

  function iniciarEditar(r: Recurso) {
    setForm({ nome: r.nome, cargo: r.cargo, tipo: r.tipo, salarioMensal: r.salarioMensal, horasContratuais: r.horasContratuais, ativo: r.ativo });
    setEditandoId(r.id);
    setMostrarForm(true);
  }

  function cancelar() {
    setMostrarForm(false);
    setEditandoId(null);
  }

  function salvar() {
    if (!form.nome.trim()) return alert('Informe o nome do recurso.');
    if (editandoId) {
      onChange(recursos.map(r => r.id === editandoId ? { ...r, ...form } : r));
    } else {
      const novo: Recurso = { ...form, id: gerarId(), criadoEm: new Date().toISOString() };
      onChange([...recursos, novo]);
    }
    setMostrarForm(false);
    setEditandoId(null);
  }

  function excluir(id: string) {
    if (!confirm('Excluir este recurso?')) return;
    onChange(recursos.filter(r => r.id !== id));
  }

  function toggleAtivo(id: string) {
    onChange(recursos.map(r => r.id === id ? { ...r, ativo: !r.ativo } : r));
  }

  const input: React.CSSProperties = {
    width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0',
    borderRadius: 6, fontSize: 14, boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1e293b' }}>Recursos Humanos</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            Cadastre colaboradores CLT e prestadores PJ para alocar horas nos projetos
          </p>
        </div>
        <button
          onClick={iniciarNovo}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
        >
          <Plus size={15} /> Novo Recurso
        </button>
      </div>

      {mostrarForm && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
            {editandoId ? 'Editar Recurso' : 'Novo Recurso'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Nome *</label>
              <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome completo" style={input} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Cargo / Função</label>
              <input value={form.cargo} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} placeholder="Ex: Analista de TI" style={input} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Tipo de Contrato</label>
              <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as TipoRecurso }))} style={input}>
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Salário / Pagamento Mensal (R$)</label>
              <input
                type="number" min={0} step={0.01}
                value={form.salarioMensal || ''}
                onChange={e => setForm(f => ({ ...f, salarioMensal: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00" style={input}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                Horas Contratuais / Mês <span style={{ color: '#94a3b8', fontWeight: 400 }}>(padrão: {HORAS_MENSAIS_PADRAO}h)</span>
              </label>
              <input
                type="number" min={1} max={744}
                value={form.horasContratuais || ''}
                onChange={e => setForm(f => ({ ...f, horasContratuais: parseInt(e.target.value) || HORAS_MENSAIS_PADRAO }))}
                placeholder={String(HORAS_MENSAIS_PADRAO)} style={input}
              />
            </div>
          </div>

          {form.salarioMensal > 0 && form.horasContratuais > 0 && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#f0fdf4', borderRadius: 6, border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>
                Valor/hora calculado: {formatBRL(form.salarioMensal / form.horasContratuais)}
              </span>
              <span style={{ fontSize: 12, color: '#6ee7b7', marginLeft: 8 }}>
                ({formatBRL(form.salarioMensal)} ÷ {form.horasContratuais}h)
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button onClick={salvar} style={{ padding: '8px 22px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              Salvar
            </button>
            <button onClick={cancelar} style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {recursos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 40px', color: '#94a3b8', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: 15, margin: '0 0 6px' }}>Nenhum recurso cadastrado ainda.</p>
          <p style={{ fontSize: 13, margin: 0 }}>Clique em "Novo Recurso" para começar.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1e293b' }}>
                {['Nome', 'Cargo', 'Tipo', 'Salário/Mês', 'Horas/Mês', 'Valor/Hora', 'Status', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recursos.map((r, i) => {
                const valorHora = r.horasContratuais > 0 ? r.salarioMensal / r.horasContratuais : 0;
                return (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f1f5f9', opacity: r.ativo ? 1 : 0.5 }}>
                    <td style={{ padding: '11px 16px', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{r.nome}</td>
                    <td style={{ padding: '11px 16px', fontSize: 13, color: '#374151' }}>{r.cargo || '—'}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700, background: COR_TIPO[r.tipo] + '18', color: COR_TIPO[r.tipo] }}>
                        {r.tipo}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 13, fontFamily: 'monospace', color: '#374151' }}>{formatBRL(r.salarioMensal)}</td>
                    <td style={{ padding: '11px 16px', fontSize: 13, color: '#374151' }}>{r.horasContratuais}h</td>
                    <td style={{ padding: '11px 16px', fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: '#059669' }}>{formatBRL(valorHora)}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <button
                        onClick={() => toggleAtivo(r.id)}
                        title={r.ativo ? 'Desativar' : 'Ativar'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: r.ativo ? '#059669' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                      >
                        {r.ativo ? <><UserCheck size={15} /> Ativo</> : <><UserX size={15} /> Inativo</>}
                      </button>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => iniciarEditar(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} title="Editar">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => excluir(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Excluir">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '10px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: 12, color: '#64748b' }}>
            {recursos.filter(r => r.ativo).length} ativo(s) · {recursos.filter(r => !r.ativo).length} inativo(s)
          </div>
        </div>
      )}
    </div>
  );
}
