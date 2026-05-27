import { LayoutDashboard, FolderOpen, Plus, BarChart2, Users } from 'lucide-react';
import type { Projeto } from '../types';

type Pagina = 'dashboard' | 'projeto' | 'comparativo' | 'recursos';

interface SidebarProps {
  projetos: Projeto[];
  projetoAtivo: string | null;
  paginaAtiva: Pagina;
  onSelecionarProjeto: (id: string) => void;
  onIrDashboard: () => void;
  onIrComparativo: () => void;
  onIrRecursos: () => void;
  onNovoProjeto: () => void;
}

export default function Sidebar({
  projetos,
  projetoAtivo,
  paginaAtiva,
  onSelecionarProjeto,
  onIrDashboard,
  onIrComparativo,
  onIrRecursos,
  onNovoProjeto,
}: SidebarProps) {
  function navBtn(pagina: Pagina, label: string, icon: React.ReactNode, onClick: () => void) {
    const ativo = paginaAtiva === pagina;
    return (
      <button
        onClick={onClick}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 20px', border: 'none', cursor: 'pointer', textAlign: 'left',
          background: ativo ? '#334155' : 'transparent',
          color: ativo ? '#f1f5f9' : '#94a3b8',
          fontSize: 14, fontWeight: ativo ? 600 : 400,
        }}
      >
        {icon}
        {label}
      </button>
    );
  }

  return (
    <aside style={{ width: 260, minHeight: '100vh', background: '#1e293b', color: '#cbd5e1', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <BarChart2 size={22} color="#60a5fa" />
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18 }}>DRE Projetos</span>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Gestão financeira por projeto</p>
      </div>

      <nav style={{ padding: '12px 0', flex: 1 }}>
        {navBtn('dashboard', 'Dashboard Geral', <LayoutDashboard size={16} />, onIrDashboard)}
        {navBtn('comparativo', 'Comparativo', <BarChart2 size={16} />, onIrComparativo)}
        {navBtn('recursos', 'Recursos Humanos', <Users size={16} />, onIrRecursos)}

        <div style={{ padding: '16px 20px 8px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#475569' }}>
          Projetos
        </div>

        {projetos.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelecionarProjeto(p.id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 20px', border: 'none', cursor: 'pointer', textAlign: 'left',
              background: projetoAtivo === p.id && paginaAtiva === 'projeto' ? '#334155' : 'transparent',
              color: projetoAtivo === p.id && paginaAtiva === 'projeto' ? '#f1f5f9' : '#94a3b8',
              fontSize: 14,
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.cor, flexShrink: 0 }} />
            <FolderOpen size={14} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nome}</span>
          </button>
        ))}

        {projetos.length === 0 && (
          <p style={{ padding: '8px 20px', fontSize: 13, color: '#475569', fontStyle: 'italic' }}>
            Nenhum projeto ainda
          </p>
        )}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #334155' }}>
        <button
          onClick={onNovoProjeto}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px 16px', border: 'none', borderRadius: 8, cursor: 'pointer',
            background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: 14,
          }}
        >
          <Plus size={16} />
          Novo Projeto
        </button>
      </div>
    </aside>
  );
}
