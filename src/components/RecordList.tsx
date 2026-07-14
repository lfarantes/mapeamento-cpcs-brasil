import React, { useState } from 'react';
import { REDCapRecord, REDCAP_INSTRUMENTS, UserProfile, getEstadoNameById } from '../types';
import { Search, Eye, Edit2, Trash2, FileDown, Plus, MapPin, Building, Activity, Layers, Users2, ShieldAlert } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface RecordListProps {
  records: REDCapRecord[];
  user: UserProfile;
  onNavigate: (tab: string, recordId?: string) => void;
  onDeleteRecord: (id: string) => void;
}

export default function RecordList({ records, user, onNavigate, onDeleteRecord }: RecordListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedNature, setSelectedNature] = useState('all');
  const [viewRecord, setViewRecord] = useState<REDCapRecord | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Filter records
  const filteredRecords = records.filter(rec => {
    const matchSearch = 
      rec.ii_1_1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.ii_1_2 || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.record_id.includes(searchTerm) ||
      rec.ii_1_3_6.toLowerCase().includes(searchTerm.toLowerCase());

    const matchState = selectedState === 'all' || rec.ii_1_3_7 === selectedState;
    const matchNature = selectedNature === 'all' || rec.ii_1_11 === selectedNature;

    return matchSearch && matchState && matchNature;
  });

  const getNatureLabel = (val: string) => {
    switch (val) {
      case '1': return 'Pública';
      case '2': return 'Privada';
      case '3': return 'Filantrópica';
      case '4': return 'Mista';
      default: return 'Não informado';
    }
  };

  const getStatusBadge = (status: '0' | '1' | '2') => {
    switch (status) {
      case '2':
        return <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-150 px-2 py-0.5 rounded-full font-sans uppercase">Completo</span>;
      case '1':
        return <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-150 px-2 py-0.5 rounded-full font-sans uppercase">Não Verificado</span>;
      default:
        return <span className="text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-150 px-2 py-0.5 rounded-full font-sans uppercase">Incompleto</span>;
    }
  };

  const getOverallProgress = (rec: REDCapRecord) => {
    let completed = 0;
    REDCAP_INSTRUMENTS.forEach(inst => {
      if (rec[inst.statusField] === '2') completed++;
    });
    return Math.round((completed / 6) * 100);
  };

  // Modern PDF export using browser Print engine (or html2canvas for a direct file if needed)
  const handlePrintRecord = async (rec: REDCapRecord) => {
    setIsExporting(true);
    // Let's create an elegant printable document layout in a temporary element and print it!
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para gerar o relatório em PDF.');
      setIsExporting(false);
      return;
    }

    const stateName = getEstadoNameById(rec.ii_1_3_7);
    const natureName = getNatureLabel(rec.ii_1_11);

    // Render detailed report to print window
    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório REDCap - CPC ${rec.ii_1_2}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; }
            h1 { font-size: 24px; font-weight: bold; margin-bottom: 5px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            h2 { font-size: 16px; font-weight: bold; margin-top: 30px; margin-bottom: 15px; color: #2563eb; background-color: #eff6ff; padding: 6px 12px; border-left: 4px solid #2563eb; }
            .header { margin-bottom: 30px; display: flex; justify-content: space-between; align-items: start; }
            .header-info { max-width: 70%; }
            .meta-badge { font-weight: bold; color: #334155; font-size: 11px; padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px; display: inline-block; margin-top: 5px; background: #f8fafc; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px; }
            .field { border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
            .label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; }
            .value { font-size: 13px; font-weight: 500; color: #0f172a; margin-top: 2px; }
            .checkbox-list { font-size: 12px; margin-top: 5px; padding-left: 15px; }
            .checkbox-item { margin-bottom: 3px; }
            .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
            @media print {
              body { padding: 0; }
              @page { size: A4; margin: 20mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-info">
              <h1>Relatório de Auditoria e Conformidade</h1>
              <div class="value" style="font-weight: bold; font-size: 15px;">${rec.ii_1_1}</div>
              <div class="meta-badge">Sigla: ${rec.ii_1_2 || 'Não informada'} | CNPJ: ${rec.ii_1_7 || 'Não informado'}</div>
            </div>
            <div style="text-align: right;">
              <div class="label">Registro ID</div>
              <div class="value" style="font-size: 20px; font-weight: bold; color: #2563eb;">#${rec.record_id}</div>
              <div class="label" style="margin-top: 10px;">Taxa de Preenchimento</div>
              <div class="value" style="font-weight: bold; color: #10b981;">${getOverallProgress(rec)}%</div>
            </div>
          </div>

          <h2>1. Identificação Institucional</h2>
          <div class="grid">
            <div class="field"><div class="label">Endereço Completo</div><div class="value">${rec.ii_1_3_2 || 'N/A'}, ${rec.ii_1_3_3 || 'N/A'} - ${rec.ii_1_3_4 || ''}</div></div>
            <div class="field"><div class="label">CEP / Bairro</div><div class="value">${rec.ii_1_3_1 || 'N/A'} - ${rec.ii_1_3_5 || 'N/A'}</div></div>
            <div class="field"><div class="label">Cidade / Estado</div><div class="value">${rec.ii_1_3_6 || 'N/A'} - ${stateName}</div></div>
            <div class="field"><div class="label">Contato Telefônico</div><div class="value">${rec.ii_1_4 || 'N/A'} ${rec.ii_1_4_1 ? ' / ' + rec.ii_1_4_1 : ''}</div></div>
            <div class="field"><div class="label">E-mail para Contato</div><div class="value">${rec.ii_1_5 || 'N/A'}</div></div>
            <div class="field"><div class="label">WebSite Oficial</div><div class="value">${rec.ii_1_6 || 'Não possui / Não se aplica'}</div></div>
            <div class="field"><div class="label">Área Física Dedicada</div><div class="value">${rec.ii_1_8 === '1' ? 'Sim' : 'Não'}</div></div>
            <div class="field"><div class="label">Natureza Jurídica</div><div class="value">${natureName}</div></div>
            <div class="field"><div class="label">Ano de Formalização</div><div class="value">${rec.ii_1_12 || 'N/A'}</div></div>
            <div class="field"><div class="label">Instituição Mantenedora</div><div class="value">${rec.ii_1_13 || 'Não possui / Não se aplica'}</div></div>
          </div>

          <h2>2. Estrutura Física</h2>
          <div class="grid">
            <div class="field"><div class="label">Área Construída</div><div class="value">${rec.qual_area_construcao_cpc ? rec.qual_area_construcao_cpc + ' m²' : 'N/A'}</div></div>
            <div class="field"><div class="label">Licença / Alvará Sanitário</div><div class="value">${rec.ef_2_2 === '1' ? 'Sim' : 'Não / N/A'}</div></div>
            <div class="field"><div class="label">AVCB Corpo de Bombeiros</div><div class="value">${rec.ef_2_3 === '1' ? 'Sim' : 'Não / N/A'}</div></div>
            <div class="field"><div class="label">Acessibilidade PNE</div><div class="value">${rec.ef_2_4 === '1' ? 'Sim' : 'Não / N/A'}</div></div>
          </div>
          
          <div class="field" style="margin-top: 10px;">
            <div class="label">Ambientes Assistenciais Cadastrados (Área Própria)</div>
            <div class="checkbox-list">
              ${rec.ef_2_5.length === 0 ? '<div class="checkbox-item">— Nenhum selecionado</div>' : rec.ef_2_5.map(v => `<div class="checkbox-item">• Ambiente Cód. ${v}</div>`).join('')}
            </div>
          </div>

          <h2>3. Equipamentos de Pesquisa e Assistência</h2>
          <div class="grid">
            <div class="field">
              <div class="label">Apoio e Assistência ao Participante</div>
              <div class="checkbox-list">
                ${rec.eq_3_1.length === 0 ? '<div class="checkbox-item">— Nenhum</div>' : rec.eq_3_1.map(v => `<div class="checkbox-item">• Equipamento Assistencial Cód. ${v}</div>`).join('')}
              </div>
            </div>
            <div class="field">
              <div class="label">Manipulação de Amostras Biológicas</div>
              <div class="checkbox-list">
                ${rec.eq_3_2.length === 0 ? '<div class="checkbox-item">— Nenhum</div>' : rec.eq_3_2.map(v => `<div class="checkbox-item">• Equipamento Laboratorial Cód. ${v}</div>`).join('')}
              </div>
            </div>
          </div>

          <h2>4. Capacidade Técnica e Estudos Conduzidos</h2>
          <div class="grid">
            <div class="field"><div class="label">Estudos Indústria (Últimos 3 Anos)</div><div class="value">${rec.ct_4_5 || 'Não informado'}</div></div>
            <div class="field"><div class="label">Estudos Indústria (Histórico Total)</div><div class="value">${rec.ct_4_6 || 'Não informado'}</div></div>
            <div class="field"><div class="label">Estudos Investigador (Últimos 3 Anos)</div><div class="value">${rec.ct_4_7 || 'Não informado'}</div></div>
            <div class="field"><div class="label">Estudos Investigador (Histórico Total)</div><div class="value">${rec.ct_4_8 || 'Não informado'}</div></div>
          </div>

          <h2>5. Recursos Humanos e Formação</h2>
          <div class="grid">
            <div class="field"><div class="label">Regime da Equipe Exclusiva</div><div class="value">${rec.rh_5_1_2 === '1' ? 'Integral' : rec.rh_5_1_2 === '2' ? 'Parcial' : 'Sob Demanda'}</div></div>
            <div class="field"><div class="label">Pós-Graduados em Pesquisa Clínica</div><div class="value">${rec.rh_5_3_n === '1' ? rec.rh_5_3 + ' profissionais' : 'Não possui'}</div></div>
          </div>

          <div class="footer">
            <div>Documento exportado automaticamente do Portal REDCap CPC - Conformidade GCP e Auditoria</div>
            <div>Data da Exportação: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-slate-800 tracking-tight">Centros de Pesquisa Clínica</h1>
          <p className="text-slate-500 text-sm mt-1 leading-relaxed">
            Visualização, exportação de relatórios PDF e controle de registros integrados com dicionário REDCap.
          </p>
        </div>
        {user.permissions.canInsertData && (
          <button
            onClick={() => onNavigate('insert')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95 shrink-0"
          >
            <Plus size={16} />
            Inserir Novo Centro
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por nome do CPC, sigla, cidade ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC]/60 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full border border-slate-200 rounded-xl text-sm px-3 py-2 bg-white text-slate-600 font-bold focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todas as UFs</option>
            <option value="25">São Paulo (SP)</option>
            <option value="19">Rio de Janeiro (RJ)</option>
            <option value="21">Rio Grande do Sul (RS)</option>
          </select>
        </div>

        <div>
          <select
            value={selectedNature}
            onChange={(e) => setSelectedNature(e.target.value)}
            className="w-full border border-slate-200 rounded-xl text-sm px-3 py-2 bg-white text-slate-600 font-bold focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todas as Naturezas</option>
            <option value="1">Pública</option>
            <option value="2">Privada</option>
            <option value="3">Filantrópica</option>
            <option value="4">Mista</option>
          </select>
        </div>
      </div>

      {/* Records Grid */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building size={24} />
          </div>
          <h3 className="font-bold text-slate-700 font-display">Nenhum centro encontrado</h3>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
            Nenhum CPC atende aos critérios de filtros ou termo de busca informado. Tente redefinir os filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map(rec => {
            const overallProgress = getOverallProgress(rec);
            const stateName = getEstadoNameById(rec.ii_1_3_7);
            const natureLabel = getNatureLabel(rec.ii_1_11);

            return (
              <div 
                key={rec.record_id} 
                className="bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-sm hover:border-slate-350 transition-all duration-200 flex flex-col overflow-hidden group"
              >
                {/* Header card info */}
                <div className="p-5 border-b border-slate-100 flex-1 space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-mono text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                      REDCap ID #{rec.record_id}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <MapPin size={11} />
                      {rec.ii_1_3_6}, {stateName}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {rec.ii_1_1}
                    </h3>
                    {rec.ii_1_2 && (
                      <p className="text-xs text-slate-400 font-bold mt-1">Sigla: {rec.ii_1_2}</p>
                    )}
                  </div>

                  {/* Core stats indicators */}
                  <div className="grid grid-cols-3 gap-3 bg-[#F8FAFC] p-2.5 rounded-xl text-center border border-slate-100/40">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Natureza</span>
                      <span className="text-[10px] font-bold text-slate-700 truncate block mt-0.5">{natureLabel}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Área Física</span>
                      <span className="text-[10px] font-bold text-slate-700 block mt-0.5">{rec.ii_1_8 === '1' ? 'Sim' : 'Não'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Fundado</span>
                      <span className="text-[10px] font-bold text-slate-700 block mt-0.5 font-mono">{rec.ii_1_12 || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Complete states check boxes stack */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Preenchimento de Instrumentos</span>
                      <span className="text-blue-600 font-mono font-bold">{overallProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${overallProgress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                    
                    {/* Tiny visual check status of the 6 forms */}
                    <div className="flex justify-between gap-1 pt-1">
                      {REDCAP_INSTRUMENTS.map(inst => {
                        const s = rec[inst.statusField] as '0' | '1' | '2';
                        let dotColor = 'bg-slate-200';
                        if (s === '1') dotColor = 'bg-amber-400';
                        else if (s === '2') dotColor = 'bg-emerald-500';
                        return (
                          <div 
                            key={inst.id} 
                            className={`flex-1 h-1.5 rounded-full ${dotColor}`}
                            title={`${inst.name}: ${s === '2' ? 'Completo' : s === '1' ? 'Não Verificado' : 'Incompleto'}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom action panel */}
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewRecord(rec)}
                      className="p-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
                      title="Visualizar Detalhes"
                    >
                      <Eye size={15} />
                    </button>
                    {user.permissions.canEditData && (
                      <button
                        onClick={() => onNavigate('insert', rec.record_id)}
                        className="p-1.5 bg-white border border-slate-200 hover:border-slate-300 text-blue-600 hover:text-blue-800 rounded-lg transition-colors"
                        title="Editar Registro"
                      >
                        <Edit2 size={15} />
                      </button>
                    )}
                    {user.permissions.canDeleteData && (
                      <button
                        onClick={() => {
                          if (confirm(`Tem certeza de que deseja deletar permanentemente o centro "${rec.ii_1_1}"? Esta ação gerará um log de auditoria permanente.`)) {
                            onDeleteRecord(rec.record_id);
                          }
                        }}
                        className="p-1.5 bg-white border border-slate-200 hover:border-red-300 text-red-500 hover:text-red-700 rounded-lg transition-colors"
                        title="Deletar Registro"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  {user.permissions.canExportPDF ? (
                    <button
                      onClick={() => handlePrintRecord(rec)}
                      disabled={isExporting}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-100 hover:border-blue-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors active:scale-95"
                    >
                      <FileDown size={14} />
                      {isExporting ? 'Exportando...' : 'Exportar PDF'}
                    </button>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 italic">Sem permissão PDF</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record detail modal */}
      {viewRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-start">
              <div>
                <span className="text-xs font-bold bg-blue-600 px-2.5 py-1 rounded text-white font-mono uppercase tracking-wider">
                  REDCap Registro #{viewRecord.record_id}
                </span>
                <h2 className="text-xl font-bold font-display mt-2 leading-snug">{viewRecord.ii_1_1}</h2>
              </div>
              <button 
                onClick={() => setViewRecord(null)}
                className="text-slate-400 hover:text-white transition-colors text-xl font-bold bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            {/* Modal content */}
            <div className="p-6 overflow-y-auto space-y-8 divide-y divide-slate-100">
              
              {/* Overall completeness */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-700 text-sm">Status Consolidado de Preenchimento</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Indicadores dos 6 instrumentos do projeto no REDCap.</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500 block uppercase">Taxa Geral</span>
                    <span className="text-lg font-black text-blue-600 font-mono">{getOverallProgress(viewRecord)}%</span>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="flex gap-2">
                    {REDCAP_INSTRUMENTS.map(inst => (
                      <div key={inst.id} className="text-center">
                        <span className="text-[9px] font-bold text-slate-400 block max-w-[60px] truncate">{inst.name}</span>
                        <div className="mt-1 flex justify-center">{getStatusBadge(viewRecord[inst.statusField] as '0' | '1' | '2')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instrument 1 Details */}
              <div className="pt-6">
                <h3 className="text-base font-bold text-blue-600 font-display flex items-center gap-2 mb-4">
                  <Building size={16} />
                  1. Identificação Institucional
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Sigla do CPC</span>
                    <span className="font-medium text-slate-800">{viewRecord.ii_1_2 || 'Não se aplica'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase">CNPJ Utilizado</span>
                    <span className="font-medium text-slate-800 font-mono">{viewRecord.ii_1_7 || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Endereço / CEP</span>
                    <span className="font-medium text-slate-800">
                      {viewRecord.ii_1_3_2}, {viewRecord.ii_1_3_3} {viewRecord.ii_1_3_4 ? `(${viewRecord.ii_1_3_4})` : ''} - CEP {viewRecord.ii_1_3_1}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Bairro / Cidade / Estado</span>
                    <span className="font-medium text-slate-800">
                      {viewRecord.ii_1_3_5}, {viewRecord.ii_1_3_6} - {getEstadoNameById(viewRecord.ii_1_3_7)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Contatos Telefônicos</span>
                    <span className="font-medium text-slate-800 font-mono">{viewRecord.ii_1_4} {viewRecord.ii_1_4_1 ? ` / ${viewRecord.ii_1_4_1}` : ''}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Email Oficial</span>
                    <span className="font-medium text-slate-800">{viewRecord.ii_1_5}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Website</span>
                    <span className="font-medium text-slate-800">{viewRecord.ii_1_6 || 'Não possui'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Área Física Exclusiva</span>
                    <span className="font-medium text-slate-800">{viewRecord.ii_1_8 === '1' ? 'Sim, possui área física de uso exclusivo' : 'Não possui área exclusiva'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Natureza Jurídica</span>
                    <span className="font-medium text-slate-800">{getNatureLabel(viewRecord.ii_1_11)}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Ano de Início / Mantenedora</span>
                    <span className="font-medium text-slate-800">{viewRecord.ii_1_12} — Mantido por: {viewRecord.ii_1_13 || 'Não informada'}</span>
                  </div>
                </div>
              </div>

              {/* Instrument 2 Details */}
              <div className="pt-6">
                <h3 className="text-base font-bold text-indigo-600 font-display flex items-center gap-2 mb-4">
                  <Layers size={16} />
                  2. Estrutura Física e Ambientes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Área Construída total</span>
                    <span className="font-medium text-slate-800">{viewRecord.qual_area_construcao_cpc ? `${viewRecord.qual_area_construcao_cpc} m²` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Licenças Sanitária / AVCB Bombeiros</span>
                    <span className="font-medium text-slate-800">
                      Alvará Sanitário: {viewRecord.ef_2_2 === '1' ? 'Sim, ativo' : 'Não'} / AVCB: {viewRecord.ef_2_3 === '1' ? 'Sim, ativo' : 'Não'}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-xs font-semibold text-slate-400 block uppercase mb-1">Ambientes e Estruturas Disponíveis</span>
                    <div className="flex flex-wrap gap-1.5">
                      {viewRecord.ef_2_5.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">Nenhum ambiente cadastrado</span>
                      ) : (
                        viewRecord.ef_2_5.map(code => (
                          <span key={code} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold">
                            Cód. {code}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Instrument 4 Capacity */}
              <div className="pt-6">
                <h3 className="text-base font-bold text-amber-600 font-display flex items-center gap-2 mb-4">
                  <Activity size={16} />
                  4. Capacidade Técnica e Projetos Conduzidos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Patrocinados (3 anos)</span>
                    <span className="text-lg font-bold text-slate-700 block mt-1">{viewRecord.ct_4_5 || 'Não inf.'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Patrocinados (Histórico)</span>
                    <span className="text-lg font-bold text-slate-700 block mt-1">{viewRecord.ct_4_6 || 'Não inf.'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Investigador (3 anos)</span>
                    <span className="text-lg font-bold text-slate-700 block mt-1">{viewRecord.ct_4_7 || 'Não inf.'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Investigador (Histórico)</span>
                    <span className="text-lg font-bold text-slate-700 block mt-1">{viewRecord.ct_4_8 || 'Não inf.'}</span>
                  </div>
                </div>
              </div>

              {/* Instrument 5 Staff */}
              <div className="pt-6">
                <h3 className="text-base font-bold text-purple-600 font-display flex items-center gap-2 mb-4">
                  <Users2 size={16} />
                  5. Recursos Humanos e Formação da Equipe
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Regime de Dedicação Operacional</span>
                    <span className="font-medium text-slate-800">
                      {viewRecord.rh_5_1_2 === '1' ? 'Dedicado Integralmente' : viewRecord.rh_5_1_2 === '2' ? 'Dedicado Parcialmente' : 'Dedicado Sob demanda por projeto'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Profissionais com Pós em Pesquisa Clínica</span>
                    <span className="font-medium text-slate-800">
                      {viewRecord.rh_5_3_n === '1' ? `Sim, possui ${viewRecord.rh_5_3} profissionais pós-graduados` : 'Não possui profissionais com essa especialização'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">
                Criado por <span className="font-semibold text-slate-500">{viewRecord.created_by}</span> em {new Date(viewRecord.created_at).toLocaleDateString('pt-BR')}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => setViewRecord(null)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all active:scale-95"
                >
                  Fechar
                </button>
                {user.permissions.canExportPDF && (
                  <button
                    onClick={() => handlePrintRecord(viewRecord)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all active:scale-95"
                  >
                    <FileDown size={16} />
                    Imprimir PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
