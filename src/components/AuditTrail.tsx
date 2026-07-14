import React, { useState } from 'react';
import { AuditLog, UserProfile } from '../types';
import { Search, Calendar, FileText, Download, ShieldCheck } from 'lucide-react';

interface AuditTrailProps {
  auditLogs: AuditLog[];
  user: UserProfile;
}

export default function AuditTrail({ auditLogs, user }: AuditTrailProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  // Filter logs
  const filteredLogs = auditLogs
    .filter(log => {
      const matchSearch = 
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.recordId.includes(searchTerm) ||
        (log.instrument || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchRole = selectedRole === 'all' || log.userRole === selectedRole;
      const matchAction = selectedAction === 'all' || log.action === selectedAction;

      return matchSearch && matchRole && matchAction;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Distinct actions for filter
  const distinctActions = Array.from(new Set(auditLogs.map(l => l.action)));

  // Export CSV representation
  const exportToCSV = () => {
    const headers = ['ID', 'Data/Hora', 'Usuário', 'Perfil', 'Ação', 'Registro REDCap ID', 'Instrumento', 'Detalhes'];
    const rows = filteredLogs.map(log => [
      log.id,
      new Date(log.timestamp).toLocaleString('pt-BR'),
      log.userName,
      log.userRole,
      log.action,
      log.recordId,
      log.instrument || 'N/A',
      log.details
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(';'), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(';'))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `auditoria_redcap_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user.permissions.canViewAuditTrail) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm my-12">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 font-display">Acesso Restrito</h2>
        <p className="text-slate-500 text-sm mt-2 leading-relaxed">
          O seu perfil de acesso atual <strong>({user.role})</strong> não possui permissões para visualizar o registro de auditoria completo (Audit Trail) do projeto. Entre em contato com o administrador caso necessite desta permissão.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-slate-800 tracking-tight">Trilha de Auditoria (Audit Trail)</h1>
          <p className="text-slate-500 text-sm mt-1 leading-relaxed">
            Registro histórico de conformidade, inserção de dados, alterações de status e controle de acesso.
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-white border border-slate-200 hover:border-slate-350 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors active:bg-slate-50"
        >
          <Download size={14} />
          Exportar CSV (Excel)
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por usuário, instrumento, registro ou detalhe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC]/60 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filter by Role */}
        <div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full border border-slate-200 rounded-xl text-sm px-3 py-2 bg-white text-slate-600 font-bold focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos os Perfis</option>
            <option value="Administrador">Administrador</option>
            <option value="Coordenador">Coordenador</option>
            <option value="Pesquisador">Pesquisador</option>
            <option value="Digitador">Digitador</option>
          </select>
        </div>

        {/* Filter by Action */}
        <div>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full border border-slate-200 rounded-xl text-sm px-3 py-2 bg-white text-slate-600 font-bold focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todas as Ações</option>
            {distinctActions.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-32">Data / Hora</th>
                <th className="py-3 px-4 w-48">Usuário (Perfil)</th>
                <th className="py-3 px-4 w-40">Ação</th>
                <th className="py-3 px-4 w-28">Registro ID</th>
                <th className="py-3 px-4 w-48">Instrumento</th>
                <th className="py-3 px-4">Descrição do Detalhe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhum registro de auditoria encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  let badgeColor = 'bg-slate-100 text-slate-700';
                  if (log.action.includes('Criação')) badgeColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                  else if (log.action.includes('Atualização')) badgeColor = 'bg-blue-50 text-blue-700 border border-blue-100';
                  else if (log.action.includes('Exclusão')) badgeColor = 'bg-red-50 text-red-700 border border-red-100';
                  else if (log.action.includes('Exportação')) badgeColor = 'bg-purple-50 text-purple-700 border border-purple-100';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 text-xs font-medium text-slate-500 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {new Date(log.timestamp).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-700">{log.userName}</div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{log.userRole}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                          #{log.recordId}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                        {log.instrument ? (
                          <div className="flex items-center gap-1">
                            <FileText size={12} className="text-slate-400" />
                            {log.instrument}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Geral / Sistema</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 leading-relaxed max-w-sm">
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
          <span>Mostrando <strong>{filteredLogs.length}</strong> de <strong>{auditLogs.length}</strong> eventos de log.</span>
          <span className="font-mono">Página 1 de 1</span>
        </div>
      </div>
    </div>
  );
}
