import React, { useState, useEffect } from 'react';
import { REDCapRecord, AuditLog, UserRole, USER_PROFILES, UserProfile } from './types';
import { INITIAL_RECORDS, INITIAL_AUDIT_LOGS, EMPTY_RECORD } from './mockData';
import Dashboard from './components/Dashboard';
import RecordList from './components/RecordList';
import AuditTrail from './components/AuditTrail';
import DataInsertion from './components/DataInsertion';
import { LayoutGrid, ClipboardEdit, ClipboardCheck, History, Database, UserSquare2, Shield, LogOut, ChevronDown } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Administrador');
  const [currentUser, setCurrentUser] = useState<UserProfile>(USER_PROFILES.Administrador);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  // Load persistent states from localStorage or use initial mock data
  const [records, setRecords] = useState<REDCapRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const cachedRecords = localStorage.getItem('redcap_cpc_records');
    const cachedLogs = localStorage.getItem('redcap_cpc_audit_logs');

    if (cachedRecords) {
      setRecords(JSON.parse(cachedRecords));
    } else {
      setRecords(INITIAL_RECORDS);
      localStorage.setItem('redcap_cpc_records', JSON.stringify(INITIAL_RECORDS));
    }

    if (cachedLogs) {
      setAuditLogs(JSON.parse(cachedLogs));
    } else {
      setAuditLogs(INITIAL_AUDIT_LOGS);
      localStorage.setItem('redcap_cpc_audit_logs', JSON.stringify(INITIAL_AUDIT_LOGS));
    }
  }, []);

  // Update user profile when role switches
  useEffect(() => {
    setCurrentUser(USER_PROFILES[selectedRole]);
  }, [selectedRole]);

  // Sync to local storage on changes
  const saveRecordsToLocalStorage = (newRecords: REDCapRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem('redcap_cpc_records', JSON.stringify(newRecords));
  };

  const saveLogsToLocalStorage = (newLogs: AuditLog[]) => {
    setAuditLogs(newLogs);
    localStorage.setItem('redcap_cpc_audit_logs', JSON.stringify(newLogs));
  };

  // Helper to add audit log
  const pushAuditLog = (action: string, recordId: string, details: string, instrumentName?: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      recordId,
      instrument: instrumentName,
      details,
    };
    const updated = [newLog, ...auditLogs];
    saveLogsToLocalStorage(updated);
  };

  // Save / Update Record
  const handleSaveRecord = (record: REDCapRecord, isNew: boolean, changesSummary: string) => {
    let updatedRecords: REDCapRecord[];
    if (isNew) {
      updatedRecords = [record, ...records];
      saveRecordsToLocalStorage(updatedRecords);
      pushAuditLog('Criação de Registro', record.record_id, changesSummary, 'Identificação Institucional');
    } else {
      updatedRecords = records.map(r => r.record_id === record.record_id ? record : r);
      saveRecordsToLocalStorage(updatedRecords);
      pushAuditLog('Atualização de Instrumento', record.record_id, changesSummary);
    }
    setEditingRecordId(null);
  };

  // Delete Record
  const handleDeleteRecord = (id: string) => {
    const target = records.find(r => r.record_id === id);
    if (!target) return;

    const updated = records.filter(r => r.record_id !== id);
    saveRecordsToLocalStorage(updated);
    pushAuditLog(
      'Exclusão de Registro',
      id,
      `Exclusão definitiva do centro de pesquisa "${target.ii_1_1}" efetuada pelo Administrador.`
    );
  };

  // Navigation controller with routing constraints based on user permissions
  const handleNavigate = (tab: string, recordId?: string) => {
    if (tab === 'insert') {
      if (!currentUser.permissions.canInsertData) {
        alert(`O perfil "${currentUser.role}" não possui permissão para inserir ou editar dados.`);
        return;
      }
      if (recordId) {
        setEditingRecordId(recordId);
      } else {
        setEditingRecordId(null);
      }
    }
    setCurrentTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* Left Sidebar - Premium Dark Sidebar */}
      <aside className="w-full md:w-64 bg-[#1E293B] text-slate-300 flex flex-col shrink-0 sticky top-0 md:h-screen border-r border-slate-800 no-print z-40 shadow-xl">
        {/* Brand logo & Header section */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20 shrink-0">
            <Database size={15} />
          </div>
          <div className="overflow-hidden">
            <span className="text-sm font-black text-white tracking-tight uppercase block leading-none">REDCap Sync</span>
            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider font-mono mt-1.5">Dicionário v1.0</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono px-3 mb-3">Menu Principal</p>
          
          {/* Dashboard Tab */}
          {currentUser.permissions.canViewDashboard && (
            <button
              onClick={() => handleNavigate('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 font-extrabold shadow-inner'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
              }`}
            >
              <LayoutGrid size={15} className="shrink-0" />
              Painel de Métricas
            </button>
          )}

          {/* Records Tab */}
          <button
            onClick={() => handleNavigate('records')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'records'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 font-extrabold shadow-inner'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
            }`}
          >
            <ClipboardCheck size={15} className="shrink-0" />
            Centros de Pesquisa
          </button>

          {/* Data Insertion Tab */}
          {currentUser.permissions.canInsertData && (
            <button
              onClick={() => handleNavigate('insert')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'insert'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 font-extrabold shadow-inner'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
              }`}
            >
              <ClipboardEdit size={15} className="shrink-0" />
              Inserção de Dados
            </button>
          )}

          {/* Audit Trail Tab */}
          {currentUser.permissions.canViewAuditTrail && (
            <button
              onClick={() => handleNavigate('audit')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'audit'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 font-extrabold shadow-inner'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
              }`}
            >
              <History size={15} className="shrink-0" />
              Trilha de Auditoria
            </button>
          )}

          {/* Active Profile Permission Summary */}
          <div className="pt-6 border-t border-slate-800 mt-6 px-3">
            <span className="text-[9px] font-black uppercase text-slate-500 block tracking-wider mb-2.5">Permissões de Perfil</span>
            <ul className="text-[10px] text-slate-400 space-y-2 font-bold">
              <li className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentUser.permissions.canInsertData ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                Gravação de Dados
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentUser.permissions.canDeleteData ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                Exclusão de Dados
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentUser.permissions.canExportPDF ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                Geração de PDF
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentUser.permissions.canViewAuditTrail ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                Acesso Auditoria
              </li>
            </ul>
          </div>
        </nav>

        {/* Sidebar Footer: Profile Switcher & User Avatar */}
        <div className="p-4 border-t border-slate-800 bg-[#141d2c]/40 space-y-3">
          {/* Quick Profile switcher */}
          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-800 rounded-xl px-3 py-2 shadow-2xs">
            <Shield size={12} className="text-blue-400 shrink-0" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perfil:</span>
            <div className="relative flex-1">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="bg-transparent text-[11px] font-black text-slate-200 focus:outline-none w-full pr-4 appearance-none cursor-pointer hover:text-white"
              >
                <option value="Administrador" className="bg-slate-800 text-white">Administrador</option>
                <option value="Coordenador" className="bg-slate-800 text-white">Coordenador</option>
                <option value="Pesquisador" className="bg-slate-800 text-white">Pesquisador</option>
                <option value="Digitador" className="bg-slate-800 text-white">Digitador</option>
              </select>
              <ChevronDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Current user avatar details */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/30 border border-slate-800/20">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
              {currentUser.name.substring(0, 2)}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white leading-tight truncate">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{currentUser.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Column Content Panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Top Header Panel */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 no-print">
          <div>
            <h1 className="text-sm sm:text-base font-black text-slate-800 tracking-tight">
              {currentTab === 'dashboard' && 'Estatísticas de Acompanhamento'}
              {currentTab === 'records' && 'Centros de Pesquisa Clínica'}
              {currentTab === 'insert' && (editingRecordId ? 'Editar Centro de Pesquisa' : 'Inserir Novo Centro')}
              {currentTab === 'audit' && 'Trilha de Auditoria'}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500 leading-none mt-1 font-bold">
              {currentTab === 'dashboard' && 'Métricas unificadas em tempo real'}
              {currentTab === 'records' && 'Status de preenchimento do dicionário REDCap'}
              {currentTab === 'insert' && 'Registro de conformidade e auditoria ativo'}
              {currentTab === 'audit' && 'Registro e rastreabilidade total de conformidade GCP'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {((import.meta as any).env?.VITE_REDCAP_API_TOKEN) ? (
              <span className="text-[9px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-md uppercase tracking-wider hidden sm:inline-block">
                REDCap API Conectada
              </span>
            ) : (
              <span className="text-[9px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded-md uppercase tracking-wider hidden sm:inline-block">
                REDCap Offline (Configurar .env)
              </span>
            )}
          </div>
        </header>

        {/* Dynamic central content container */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto w-full max-w-7xl mx-auto flex flex-col">
          {currentTab === 'dashboard' && currentUser.permissions.canViewDashboard && (
            <Dashboard 
              records={records} 
              auditLogs={auditLogs} 
              user={currentUser} 
              onNavigate={handleNavigate} 
            />
          )}

          {currentTab === 'records' && (
            <RecordList 
              records={records} 
              user={currentUser} 
              onNavigate={handleNavigate}
              onDeleteRecord={handleDeleteRecord}
            />
          )}

          {currentTab === 'insert' && currentUser.permissions.canInsertData && (
            <DataInsertion 
              user={currentUser}
              editingRecordId={editingRecordId}
              records={records}
              onSaveRecord={handleSaveRecord}
              onCancel={() => setCurrentTab('records')}
            />
          )}

          {currentTab === 'audit' && currentUser.permissions.canViewAuditTrail && (
            <AuditTrail 
              auditLogs={auditLogs} 
              user={currentUser} 
            />
          )}
        </main>

        {/* Aesthetic Footer */}
        <footer className="bg-white border-t border-slate-200 py-5 text-center text-[11px] text-slate-400 font-bold no-print">
          <p>&copy; 2026 Portal de Integração REDCap. Conformidade total com GCP, LGPD e Diretrizes de Auditoria.</p>
        </footer>
      </div>
    </div>
  );
}
