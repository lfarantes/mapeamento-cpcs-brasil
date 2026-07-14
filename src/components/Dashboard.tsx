import React, { useState } from 'react';
import { REDCapRecord, AuditLog, REDCAP_INSTRUMENTS, ESTADOS_LIST, UserProfile } from '../types';
import { BarChart3, PieChart, Activity, ClipboardCheck, Award, MapPin, Building2, UserCheck, ChevronRight } from 'lucide-react';

interface DashboardProps {
  records: REDCapRecord[];
  auditLogs: AuditLog[];
  user: UserProfile;
  onNavigate: (tab: string, recordId?: string) => void;
}

export default function Dashboard({ records, auditLogs, user, onNavigate }: DashboardProps) {
  const [activeChartTab, setActiveChartTab] = useState<'nature' | 'states'>('nature');

  // Stats calculation
  const totalRecords = records.length;
  
  // Completeness stats
  // For each record, there are 6 instruments. Each instrument complete value is '0' (incomplete), '1' (unverified), '2' (complete).
  let totalInstruments = totalRecords * 6;
  let completeCount = 0;
  let unverifiedCount = 0;
  let incompleteCount = 0;

  records.forEach(r => {
    REDCAP_INSTRUMENTS.forEach(inst => {
      const status = r[inst.statusField] as '0' | '1' | '2';
      if (status === '2') completeCount++;
      else if (status === '1') unverifiedCount++;
      else incompleteCount++;
    });
  });

  const completenessPercentage = totalInstruments > 0 
    ? Math.round((completeCount / totalInstruments) * 100) 
    : 0;

  // Natureza jurídica distribution
  // 1: Pública, 2: Privada, 3: Filantrópica, 4: Mista
  const natureCounts = {
    Pública: 0,
    Privada: 0,
    Filantrópica: 0,
    Mista: 0,
    'Não Informado': 0
  };

  records.forEach(r => {
    const val = r.ii_1_11;
    if (val === '1') natureCounts.Pública++;
    else if (val === '2') natureCounts.Privada++;
    else if (val === '3') natureCounts.Filantrópica++;
    else if (val === '4') natureCounts.Mista++;
    else natureCounts['Não Informado']++;
  });

  // States distribution
  const stateCounts: Record<string, number> = {};
  records.forEach(r => {
    const stateId = r.ii_1_3_7;
    const stateObj = ESTADOS_LIST.find(e => e.id === stateId);
    const stateName = stateObj ? stateObj.name : 'Outro';
    stateCounts[stateName] = (stateCounts[stateName] || 0) + 1;
  });

  const stateData = Object.entries(stateCounts)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count);

  // Recent logs
  const recentLogs = [...auditLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display text-slate-800 tracking-tight">Painel de Acompanhamento</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
            Métricas em tempo real de auditoria, preenchimento e integridade dos dados integrados do REDCap.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#F8FAFC] px-4 py-2.5 rounded-xl border border-slate-100 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">REDCap Conectado</span>
        </div>
      </div>

      {/* Grid of basic metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Centros */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-blue-400/40 hover:shadow-sm transition-all duration-250">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Centros de Pesquisa</p>
              <p className="text-3xl font-black text-slate-800 tracking-tight">{totalRecords}</p>
            </div>
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
              <Building2 size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-50">
            <span className="text-slate-500 font-medium">Cadastrados no sistema</span>
            <button 
              onClick={() => onNavigate('records')}
              className="text-blue-600 hover:text-blue-800 hover:underline font-bold flex items-center gap-0.5"
            >
              Ver todos <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Taxa de Preenchimento */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-400/40 hover:shadow-sm transition-all duration-250">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Taxa de Conclusão</p>
              <p className="text-3xl font-black text-slate-800 tracking-tight">{completenessPercentage}%</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
              <ClipboardCheck size={18} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${completenessPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span>{completeCount} / {totalInstruments} inst. completos</span>
            </div>
          </div>
        </div>

        {/* Estados Representados */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-400/40 hover:shadow-sm transition-all duration-250">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">UFs Atendidas</p>
              <p className="text-3xl font-black text-slate-800 tracking-tight">{Object.keys(stateCounts).length}</p>
            </div>
            <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
              <MapPin size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-50">
            <span className="text-slate-500">Distribuição nacional</span>
            <span className="text-indigo-600 font-bold font-mono bg-indigo-50 px-2 py-0.5 rounded-lg text-[10px]">
              {stateData[0]?.state || 'N/A'} principal
            </span>
          </div>
        </div>

        {/* Logs de Auditoria */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-amber-400/40 hover:shadow-sm transition-all duration-250">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ações de Auditoria</p>
              <p className="text-3xl font-black text-slate-800 tracking-tight">{auditLogs.length}</p>
            </div>
            <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl">
              <Activity size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-50">
            <span className="text-slate-500">Histórico de integridade</span>
            {user.permissions.canViewAuditTrail ? (
              <button 
                onClick={() => onNavigate('audit')}
                className="text-amber-600 hover:text-amber-800 hover:underline font-bold flex items-center gap-0.5"
              >
                Ver logs <ChevronRight size={12} />
              </button>
            ) : (
              <span className="text-slate-400 italic">Restrito</span>
            )}
          </div>
        </div>
      </div>

      {/* Main charts and lists section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle: Interactive Charts */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold font-display text-slate-800 flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-500" />
              Estatísticas de Distribuição
            </h2>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveChartTab('nature')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeChartTab === 'nature'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Natureza Jurídica
              </button>
              <button
                onClick={() => setActiveChartTab('states')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeChartTab === 'states'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Estados (UF)
              </button>
            </div>
          </div>

          {activeChartTab === 'nature' ? (
            <div className="flex flex-col md:flex-row items-center justify-around py-4 gap-8">
              {/* Donut Chart SVG */}
              <div className="relative w-44 h-44 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {(() => {
                    const total = Object.values(natureCounts).reduce((a, b) => a + b, 0) || 1;
                    let accumulatedPercent = 0;
                    
                    const colors = {
                      Pública: '#3b82f6',     // Blue
                      Privada: '#ef4444',     // Red
                      Filantrópica: '#10b981', // Emerald
                      Mista: '#8b5cf6',        // Violet
                      'Não Informado': '#94a3b8' // Slate
                    };

                    return Object.entries(natureCounts).map(([key, value]) => {
                      if (value === 0) return null;
                      const percent = (value / total) * 100;
                      const strokeDasharray = `${percent} ${100 - percent}`;
                      const strokeDashoffset = -accumulatedPercent;
                      accumulatedPercent += percent;

                      return (
                        <circle
                          key={key}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke={colors[key as keyof typeof colors]}
                          strokeWidth="11"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-300 hover:stroke-[13px] cursor-pointer"
                        />
                      );
                    });
                  })()}
                  <circle cx="50" cy="50" r="28" fill="white" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-700 leading-none">{totalRecords}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">CPC Totais</span>
                </div>
              </div>

              {/* Legends with Details */}
              <div className="space-y-2.5 w-full max-w-xs">
                {Object.entries(natureCounts).map(([key, value]) => {
                  const percent = totalRecords > 0 ? Math.round((value / totalRecords) * 100) : 0;
                  const colorClass = 
                    key === 'Pública' ? 'bg-blue-500' :
                    key === 'Privada' ? 'bg-red-500' :
                    key === 'Filantrópica' ? 'bg-emerald-500' :
                    key === 'Mista' ? 'bg-violet-500' : 'bg-slate-400';

                  return (
                    <div key={key} className="flex items-center justify-between border-b border-slate-50 pb-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                        <span className="text-xs font-semibold text-slate-600">{key}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-700 font-mono">{value}</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded font-mono">
                          {percent}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {stateData.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">Sem dados de estados cadastrados.</div>
              ) : (
                <div className="space-y-3.5">
                  {stateData.map(({ state, count }) => {
                    const maxCount = Math.max(...stateData.map(d => d.count)) || 1;
                    const percentOfMax = (count / maxCount) * 100;
                    const overallPercent = totalRecords > 0 ? Math.round((count / totalRecords) * 100) : 0;

                    return (
                      <div key={state} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-indigo-400" />
                            {state}
                          </span>
                          <span className="font-mono text-slate-500">{count} centro(s) ({overallPercent}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                          <div 
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${percentOfMax}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column: Recent logs & Info cards */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold font-display text-slate-800 flex items-center gap-2">
              <Activity size={18} className="text-amber-500" />
              Auditoria Recente
            </h2>
            <p className="text-xs text-slate-400 mt-1">Logs de alterações mais recentes nos dados do REDCap.</p>
          </div>

          {recentLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm italic">
              Nenhuma atividade registrada ainda.
            </div>
          ) : (
            <div className="flow-root">
              <div className="space-y-5">
                {recentLogs.map((log) => {
                  let indicatorColor = 'bg-blue-500';
                  if (log.action.includes('Criação')) indicatorColor = 'bg-emerald-500';
                  else if (log.action.includes('Exclusão')) indicatorColor = 'bg-red-500';
                  else if (log.action.includes('Exportação')) indicatorColor = 'bg-purple-500';

                  return (
                    <div key={log.id} className="flex gap-3">
                      <div className={`w-1 shrink-0 rounded-full ${indicatorColor}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-xs font-bold text-slate-800 truncate">{log.userName}</p>
                          <span className="text-[9px] text-slate-400 font-mono shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-blue-600 uppercase mt-0.5 tracking-wider">{log.action}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {log.details}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checklist / Completeness of instruments */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6">
        <div className="border-b border-slate-100 pb-4 mb-5">
          <h2 className="text-base font-bold font-display text-slate-800 flex items-center gap-2">
            <ClipboardCheck size={18} className="text-emerald-500" />
            Taxa de Preenchimento por Instrumento REDCap
          </h2>
          <p className="text-xs text-slate-400 mt-1">Status de preenchimento agrupado de todos os centros cadastrados.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {REDCAP_INSTRUMENTS.map(inst => {
            let complete = 0;
            let unverified = 0;
            let incomplete = 0;

            records.forEach(r => {
              const status = r[inst.statusField] as '0' | '1' | '2';
              if (status === '2') complete++;
              else if (status === '1') unverified++;
              else incomplete++;
            });

            const total = records.length || 1;
            const completePercent = Math.round((complete / total) * 100);
            const unverifiedPercent = Math.round((unverified / total) * 100);
            const incompletePercent = Math.round((incomplete / total) * 100);

            return (
              <div key={inst.id} className="border border-slate-150 rounded-xl p-4 bg-[#F8FAFC] hover:bg-white hover:shadow-xs hover:border-slate-350 transition-all duration-200">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-xs font-bold text-slate-700 font-display leading-tight">{inst.name}</h3>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md shrink-0">
                    {completePercent}%
                  </span>
                </div>

                {/* Progress bar stack */}
                <div className="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: `${completePercent}%` }} title="Completo" />
                  <div className="bg-amber-400 h-full" style={{ width: `${unverifiedPercent}%` }} title="Não Verificado" />
                  <div className="bg-slate-300 h-full" style={{ width: `${incompletePercent}%` }} title="Incompleto" />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2.5 pt-2.5 border-t border-slate-100/55">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {complete} OK
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {unverified} N.V.
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    {incomplete} INC
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
