import { useState, useEffect } from 'react';
import type { Projeto, Recurso } from './types';
import { loadProjetos, saveProjetos, loadRecursos, saveRecursos } from './store';
import Sidebar from './components/Sidebar';
import ModalNovoProjeto from './components/ModalNovoProjeto';
import Dashboard from './pages/Dashboard';
import PaginaProjeto from './pages/PaginaProjeto';
import Comparativo from './pages/Comparativo';
import PaginaRecursos from './pages/PaginaRecursos';

type Pagina = 'dashboard' | 'projeto' | 'comparativo' | 'recursos';

export default function App() {
  const [projetos, setProjetos] = useState<Projeto[]>(() => loadProjetos());
  const [recursos, setRecursos] = useState<Recurso[]>(() => loadRecursos());
  const [pagina, setPagina] = useState<Pagina>('dashboard');
  const [projetoAtivo, setProjetoAtivo] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => { saveProjetos(projetos); }, [projetos]);
  useEffect(() => { saveRecursos(recursos); }, [recursos]);

  function criarProjeto(projeto: Projeto) {
    setProjetos(prev => [...prev, projeto]);
    setProjetoAtivo(projeto.id);
    setPagina('projeto');
    setModalAberto(false);
  }

  function atualizarProjeto(projeto: Projeto) {
    setProjetos(prev => prev.map(p => p.id === projeto.id ? projeto : p));
  }

  function excluirProjeto(id: string) {
    if (!confirm('Excluir este projeto e todos os seus dados?')) return;
    setProjetos(prev => prev.filter(p => p.id !== id));
    setPagina('dashboard');
    setProjetoAtivo(null);
  }

  const projeto = projetos.find(p => p.id === projetoAtivo) ?? null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        projetos={projetos}
        projetoAtivo={projetoAtivo}
        paginaAtiva={pagina}
        onSelecionarProjeto={id => { setProjetoAtivo(id); setPagina('projeto'); }}
        onIrDashboard={() => setPagina('dashboard')}
        onIrComparativo={() => setPagina('comparativo')}
        onIrRecursos={() => setPagina('recursos')}
        onNovoProjeto={() => setModalAberto(true)}
      />

      <main style={{ flex: 1, padding: 32, overflowY: 'auto', background: '#f1f5f9', minHeight: '100vh' }}>
        {pagina === 'dashboard' && (
          <Dashboard
            projetos={projetos}
            onSelecionarProjeto={id => { setProjetoAtivo(id); setPagina('projeto'); }}
          />
        )}
        {pagina === 'projeto' && projeto && (
          <PaginaProjeto
            projeto={projeto}
            recursos={recursos}
            onAtualizar={atualizarProjeto}
            onExcluir={() => excluirProjeto(projeto.id)}
          />
        )}
        {pagina === 'comparativo' && (
          <Comparativo projetos={projetos} />
        )}
        {pagina === 'recursos' && (
          <PaginaRecursos
            recursos={recursos}
            onChange={setRecursos}
          />
        )}
      </main>

      {modalAberto && (
        <ModalNovoProjeto
          onSalvar={criarProjeto}
          onFechar={() => setModalAberto(false)}
        />
      )}
    </div>
  );
}
