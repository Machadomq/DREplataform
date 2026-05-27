import { useState } from 'react';
import { X } from 'lucide-react';
import type { Projeto, TipoProjeto } from '../types';
import { gerarId, CORES_PROJETO } from '../store';

const TIPOS: TipoProjeto[] = [
  'Tecnologia / TI',
  'Industrial / Manufatura',
  'Serviços / Consultoria',
  'Varejo / Comércio',
  'Outro',
];

interface Props {
  onSalvar: (projeto: Projeto) => void;
  onFechar: () => void;
}

export default function ModalNovoProjeto({ onSalvar, onFechar }: Props) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<TipoProjeto>('Tecnologia / TI');
  const [cor, setCor] = useState(CORES_PROJETO[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    const projeto: Projeto = {
      id: gerarId(),
      nome: nome.trim(),
      descricao: descricao.trim(),
      tipo,
      cor,
      criadoEm: new Date().toISOString(),
      periodos: [],
    };
    onSalvar(projeto);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 32, width: 480, maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Novo Projeto</h2>
          <button onClick={onFechar} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Nome do Projeto *
            </label>
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Projeto Alpha"
              required
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                borderRadius: 8, fontSize: 14, outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Descrição
            </label>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Breve descrição do projeto..."
              rows={2}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                borderRadius: 8, fontSize: 14, resize: 'vertical', outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Tipo de Projeto
            </label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value as TipoProjeto)}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                borderRadius: 8, fontSize: 14, background: '#fff', outline: 'none',
              }}
            >
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Cor do Projeto
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {CORES_PROJETO.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', background: c,
                    border: cor === c ? '3px solid #1e293b' : '3px solid transparent',
                    cursor: 'pointer', outline: 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onFechar}
              style={{
                padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: 8,
                background: '#fff', cursor: 'pointer', fontSize: 14, color: '#374151',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px', border: 'none', borderRadius: 8,
                background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              }}
            >
              Criar Projeto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
