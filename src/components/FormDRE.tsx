import { useState } from 'react';
import type { DRELinhas, DREPeriodo, AlocacaoRecurso, Recurso } from '../types';
import { calcularDRE, MESES } from '../store';
import { formatBRL, formatPercent } from '../utils/format';
import { Save, ChevronDown, ChevronRight, Users, FileSpreadsheet, FileCode } from 'lucide-react';
import ModalAlocacao from './ModalAlocacao';
import { exportarExcel, exportarHTML } from '../utils/exportDRE';

interface Props {
  periodo: DREPeriodo;
  recursos: Recurso[];
  nomeProjeto: string;
  onSalvar: (linhas: DRELinhas, obs: string, alocacoes: AlocacaoRecurso[]) => void;
}

function InputMoeda({ value, onChange, placeholder = '0,00' }: {
  value: number; onChange: (v: number) => void; placeholder?: string;
}) {
  const [display, setDisplay] = useState(value === 0 ? '' : String(value));
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9,.]/g, '').replace(',', '.');
    setDisplay(e.target.value.replace(/[^0-9,.]/g, ''));
    const num = parseFloat(raw);
    onChange(isNaN(num) ? 0 : num);
  }
  return (
    <input type="text" value={display} onChange={handleChange}
      onBlur={() => setDisplay(value === 0 ? '' : String(value))}
      placeholder={placeholder}
      style={{ width: 140, padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, textAlign: 'right', outline: 'none', fontFamily: 'monospace', background: '#fff' }}
    />
  );
}

function LinhaInput({ label, value, onChange, receitaBruta, placeholder }: {
  label: string; value: number; onChange: (v: number) => void; receitaBruta: number; placeholder?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '6px 16px', borderBottom: '1px solid #f8fafc', gap: 8 }}>
      <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>{label}</span>
      <InputMoeda value={value} onChange={onChange} placeholder={placeholder} />
      <span style={{ width: 70, textAlign: 'right', fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
        {receitaBruta > 0 ? formatPercent(value, receitaBruta) : '—'}
      </span>
    </div>
  );
}

function LinhaSubtotal({ label, value, receitaBruta, destaque = false }: {
  label: string; value: number; receitaBruta: number; destaque?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '9px 16px', background: destaque ? '#f0f9ff' : '#f8fafc', borderTop: '2px solid #e2e8f0', borderBottom: '2px solid #e2e8f0' }}>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#1e293b' }}>= {label}</span>
      <span style={{ width: 140, textAlign: 'right', fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: value >= 0 ? '#059669' : '#dc2626' }}>
        {formatBRL(value)}
      </span>
      <span style={{ width: 70, textAlign: 'right', fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>
        {receitaBruta > 0 ? formatPercent(value, receitaBruta) : '—'}
      </span>
    </div>
  );
}

function SecaoHeader({ titulo, total, aberta, onToggle, cor }: {
  titulo: string; total?: number; aberta: boolean; onToggle: () => void; cor: string;
}) {
  return (
    <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: cor, border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: aberta ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
      {aberta ? <ChevronDown size={14} color="#fff" /> : <ChevronRight size={14} color="#fff" />}
      <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 }}>{titulo}</span>
      {total !== undefined && (
        <span style={{ fontSize: 13, fontFamily: 'monospace', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{formatBRL(total)}</span>
      )}
    </button>
  );
}

const COR_TIPO: Record<string, string> = { CLT: '#059669', PJ: '#7c3aed', Outro: '#0369a1' };

export default function FormDRE({ periodo, recursos, nomeProjeto, onSalvar }: Props) {
  const [linhas, setLinhas] = useState<DRELinhas>({ ...periodo.linhas });
  const [obs, setObs] = useState(periodo.observacoes ?? '');
  const [alocacoes, setAlocacoes] = useState<AlocacaoRecurso[]>(periodo.alocacoes ?? []);
  const [modalAlocacao, setModalAlocacao] = useState(false);
  const [abertas, setAbertas] = useState<Record<string, boolean>>({
    receitas: true, deducoes: true, custos: true,
    comerciais: true, depreciacao: false, financeiro: false, impostos: true,
  });

  const dre = calcularDRE(linhas);
  const rol = dre.receitaLiquida;

  function set(key: keyof DRELinhas, val: number) {
    setLinhas(prev => ({ ...prev, [key]: val }));
  }
  function toggle(sec: string) {
    setAbertas(prev => ({ ...prev, [sec]: !prev[sec] }));
  }
  function aplicarAlocacoes(novas: AlocacaoRecurso[]) {
    setAlocacoes(novas);
    const totalCLT = novas.filter(a => a.tipoSnapshot === 'CLT').reduce((s, a) => s + a.custo, 0);
    const totalPJ = novas.filter(a => a.tipoSnapshot === 'PJ').reduce((s, a) => s + a.custo, 0);
    setLinhas(prev => ({ ...prev, custoPessoal: totalCLT, custoServicosTerc: totalPJ }));
    setModalAlocacao(false);
  }

  const mesPeriodo = `${MESES[periodo.mes - 1]} ${periodo.ano}`;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 8, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>DRE — {mesPeriodo}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => exportarHTML(nomeProjeto, mesPeriodo, dre, alocacoes)} title="Exportar HTML"
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#0f766e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            <FileCode size={14} /> HTML
          </button>
          <button onClick={() => exportarExcel(nomeProjeto, mesPeriodo, dre, alocacoes)} title="Exportar Excel"
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            <FileSpreadsheet size={14} /> Excel
          </button>
          <button onClick={() => onSalvar(linhas, obs, alocacoes)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
            <Save size={14} /> Salvar
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', background: '#1e293b', borderRadius: '8px 8px 0 0', gap: 8 }}>
        <span style={{ flex: 1, fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>LINHA</span>
        <span style={{ width: 140, textAlign: 'right', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>VALOR (R$)</span>
        <span style={{ width: 70, textAlign: 'right', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>% ROL</span>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden', background: '#fff' }}>

        {/* RECEITAS */}
        <SecaoHeader titulo="Receitas" total={dre.receitaBruta} aberta={abertas.receitas} onToggle={() => toggle('receitas')} cor="#1d4ed8" />
        {abertas.receitas && <>
          <LinhaInput label="Consultoria / Treinamento" value={linhas.receitaConsultoria} onChange={v => set('receitaConsultoria', v)} receitaBruta={rol} />
          <LinhaInput label="Adequação / Desenvolvimento" value={linhas.receitaAdequacao} onChange={v => set('receitaAdequacao', v)} receitaBruta={rol} />
          <LinhaInput label="Recorrência / SaaS" value={linhas.receitaRecorrencia} onChange={v => set('receitaRecorrencia', v)} receitaBruta={rol} />
          <LinhaInput label="Royalties" value={linhas.receitaRoyalties} onChange={v => set('receitaRoyalties', v)} receitaBruta={rol} />
          <LinhaInput label="Outras Receitas" value={linhas.receitaOutras} onChange={v => set('receitaOutras', v)} receitaBruta={rol} />
        </>}
        <LinhaSubtotal label="Receita Operacional Bruta" value={dre.receitaBruta} receitaBruta={rol} />

        {/* DEDUÇÕES */}
        <SecaoHeader titulo="Deduções da Receita Bruta" total={dre.totalDeducoes} aberta={abertas.deducoes} onToggle={() => toggle('deducoes')} cor="#7c3aed" />
        {abertas.deducoes && <>
          <LinhaInput label="PIS sobre Vendas/Serviços" value={linhas.pis} onChange={v => set('pis', v)} receitaBruta={rol} placeholder="ex: 8438" />
          <LinhaInput label="COFINS sobre Vendas/Serviços" value={linhas.cofins} onChange={v => set('cofins', v)} receitaBruta={rol} placeholder="ex: 38948" />
          <LinhaInput label="ISSQN sobre Serviços" value={linhas.iss} onChange={v => set('iss', v)} receitaBruta={rol} placeholder="ex: 25965" />
          <LinhaInput label="Devoluções de Serviços" value={linhas.devolucoes} onChange={v => set('devolucoes', v)} receitaBruta={rol} />
        </>}
        <LinhaSubtotal label="Receita Operacional Líquida (ROL)" value={dre.receitaLiquida} receitaBruta={rol} destaque />

        {/* CUSTOS */}
        <SecaoHeader titulo="Custo dos Serviços Prestados" total={dre.totalCustos} aberta={abertas.custos} onToggle={() => toggle('custos')} cor="#b45309" />
        {abertas.custos && <>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #fef3c7', background: '#fffbeb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>
                {alocacoes.length > 0 ? `${alocacoes.length} recurso(s) alocado(s) neste período` : 'Alocar horas dos recursos para calcular custos automaticamente'}
              </span>
              <button onClick={() => setModalAlocacao(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: '#b45309', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                <Users size={12} /> Alocar Recursos
              </button>
            </div>
            {alocacoes.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {alocacoes.map(a => (
                  <div key={a.recursoId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', borderBottom: '1px solid #fde68a' }}>
                    <span style={{ padding: '1px 5px', borderRadius: 3, fontSize: 10, fontWeight: 700, background: COR_TIPO[a.tipoSnapshot] + '18', color: COR_TIPO[a.tipoSnapshot] }}>{a.tipoSnapshot}</span>
                    <span style={{ flex: 1, fontSize: 12, color: '#374151' }}>{a.nomeSnapshot}</span>
                    <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{a.horas}h × {formatBRL(a.valorHoraSnapshot)}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: '#1e293b' }}>= {formatBRL(a.custo)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <LinhaInput label="Despesas com Pessoal (CLT)" value={linhas.custoPessoal} onChange={v => set('custoPessoal', v)} receitaBruta={rol} />
          <LinhaInput label="Serviços de Terceiros (PJ)" value={linhas.custoServicosTerc} onChange={v => set('custoServicosTerc', v)} receitaBruta={rol} />
          <LinhaInput label="Assessoria Técnica" value={linhas.assessoriaTecnica} onChange={v => set('assessoriaTecnica', v)} receitaBruta={rol} />
          <LinhaInput label="Serviços Administrativos e Gestão" value={linhas.servicosAdmGestao} onChange={v => set('servicosAdmGestao', v)} receitaBruta={rol} />
          <LinhaInput label="Viagens e Deslocamentos" value={linhas.custoViagens} onChange={v => set('custoViagens', v)} receitaBruta={rol} />
          <LinhaInput label="Reembolso de Viagens" value={linhas.reembolsoViagens} onChange={v => set('reembolsoViagens', v)} receitaBruta={rol} />
          <LinhaInput label="Software / Infraestrutura" value={linhas.custoSoftware} onChange={v => set('custoSoftware', v)} receitaBruta={rol} />
          <LinhaInput label="Outras Despesas de Custo" value={linhas.custoOutros} onChange={v => set('custoOutros', v)} receitaBruta={rol} />
        </>}
        <LinhaSubtotal label="Lucro Operacional Bruto" value={dre.lucroBruto} receitaBruta={rol} destaque />

        {/* DESPESAS COMERCIAIS */}
        <SecaoHeader titulo="Despesas Comerciais" total={dre.totalDespesasComerciais} aberta={abertas.comerciais} onToggle={() => toggle('comerciais')} cor="#0f766e" />
        {abertas.comerciais && <>
          <LinhaInput label="Comissões sobre Vendas" value={linhas.comissaoVendas} onChange={v => set('comissaoVendas', v)} receitaBruta={rol} />
          <LinhaInput label="Comissões sobre Recorrência" value={linhas.comissaoRecorrencia} onChange={v => set('comissaoRecorrencia', v)} receitaBruta={rol} />
          <LinhaInput label="Indenização a Clientes" value={linhas.indenizacaoClientes} onChange={v => set('indenizacaoClientes', v)} receitaBruta={rol} />
          <LinhaInput label="Contas Incobráveis" value={linhas.contasIncobráveis} onChange={v => set('contasIncobráveis', v)} receitaBruta={rol} />
          <LinhaInput label="Outras Desp. Comerciais" value={linhas.despComercialOutras} onChange={v => set('despComercialOutras', v)} receitaBruta={rol} />
        </>}
        <LinhaSubtotal label="EBITDA" value={dre.ebitda} receitaBruta={rol} destaque />

        {/* DEPRECIAÇÃO */}
        <SecaoHeader titulo="Depreciação e Amortização" total={dre.depreciacao} aberta={abertas.depreciacao} onToggle={() => toggle('depreciacao')} cor="#475569" />
        {abertas.depreciacao && (
          <LinhaInput label="Depreciação / Amortização" value={linhas.depreciacao} onChange={v => set('depreciacao', v)} receitaBruta={rol} />
        )}
        <LinhaSubtotal label="EBIT (Lucro Operacional Líquido)" value={dre.ebit} receitaBruta={rol} />

        {/* RESULTADO FINANCEIRO */}
        <SecaoHeader titulo="Resultado Financeiro" total={dre.resultadoFinanceiro} aberta={abertas.financeiro} onToggle={() => toggle('financeiro')} cor="#0369a1" />
        {abertas.financeiro && <>
          <LinhaInput label="Juros e Encargos s/ Empréstimos" value={linhas.despesasFinanceiras} onChange={v => set('despesasFinanceiras', v)} receitaBruta={rol} />
          <LinhaInput label="Variação Cambial Passiva" value={linhas.variacaoCambial} onChange={v => set('variacaoCambial', v)} receitaBruta={rol} />
          <LinhaInput label="Despesas Bancárias" value={linhas.despesasBancarias} onChange={v => set('despesasBancarias', v)} receitaBruta={rol} />
          <LinhaInput label="IOF" value={linhas.iof} onChange={v => set('iof', v)} receitaBruta={rol} />
          <LinhaInput label="Multa de Mora" value={linhas.multaMora} onChange={v => set('multaMora', v)} receitaBruta={rol} />
          <LinhaInput label="Receitas Financeiras (aplicações)" value={linhas.receitasFinanceiras} onChange={v => set('receitasFinanceiras', v)} receitaBruta={rol} />
        </>}
        <LinhaSubtotal label="Lucro Antes do IR (LAIR)" value={dre.lair} receitaBruta={rol} />

        {/* IMPOSTOS */}
        <SecaoHeader titulo="Impostos sobre o Resultado" total={dre.totalImpostos} aberta={abertas.impostos} onToggle={() => toggle('impostos')} cor="#9f1239" />
        {abertas.impostos && <>
          <LinhaInput label="IRPJ" value={linhas.irpj} onChange={v => set('irpj', v)} receitaBruta={rol} />
          <LinhaInput label="CSLL" value={linhas.csll} onChange={v => set('csll', v)} receitaBruta={rol} />
          <LinhaInput label="IRPJ Diferido" value={linhas.irpjDiferido} onChange={v => set('irpjDiferido', v)} receitaBruta={rol} />
          <LinhaInput label="CSLL Diferido" value={linhas.csllDiferido} onChange={v => set('csllDiferido', v)} receitaBruta={rol} />
        </>}

        {/* LUCRO LÍQUIDO */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', background: dre.lucroLiquido >= 0 ? '#f0fdf4' : '#fef2f2', borderTop: `3px solid ${dre.lucroLiquido >= 0 ? '#16a34a' : '#dc2626'}` }}>
          <span style={{ flex: 1, fontSize: 16, fontWeight: 800, color: '#1e293b' }}>= LUCRO LÍQUIDO DO EXERCÍCIO</span>
          <span style={{ width: 140, textAlign: 'right', fontSize: 16, fontWeight: 800, fontFamily: 'monospace', color: dre.lucroLiquido >= 0 ? '#16a34a' : '#dc2626' }}>
            {formatBRL(dre.lucroLiquido)}
          </span>
          <span style={{ width: 70, textAlign: 'right', fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>
            {rol > 0 ? formatPercent(dre.lucroLiquido, rol) : '—'}
          </span>
        </div>

        <div style={{ padding: 16, borderTop: '1px solid #f1f5f9' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Observações do período</label>
          <textarea value={obs} onChange={e => setObs(e.target.value)}
            placeholder="Notas, contexto ou explicações sobre este período..."
            rows={2}
            style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      {modalAlocacao && (
        <ModalAlocacao
          recursos={recursos}
          alocacoesExistentes={alocacoes}
          onSalvar={aplicarAlocacoes}
          onFechar={() => setModalAlocacao(false)}
        />
      )}
    </div>
  );
}
