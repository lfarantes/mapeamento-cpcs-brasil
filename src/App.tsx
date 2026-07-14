import React, { useState, useEffect } from 'react';
import { REDCapRecord, AuditLog, UserRole, USER_PROFILES, UserProfile } from './types';
import { INITIAL_RECORDS, INITIAL_AUDIT_LOGS, EMPTY_RECORD } from './mockData';
import Dashboard from './components/Dashboard';
import RecordList from './components/RecordList';
import AuditTrail from './components/AuditTrail';
import DataInsertion from './components/DataInsertion';
import { LayoutGrid, ClipboardEdit, ClipboardCheck, History, Database, UserSquare2, Shield, LogOut, ChevronDown, ArrowLeft } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Administrador');
  const [currentUser, setCurrentUser] = useState<UserProfile>(USER_PROFILES.Administrador);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [accessMode, setAccessMode] = useState<'portal' | 'public_form' | null>(null);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

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

  // Update user profile when role or access mode switches
  useEffect(() => {
    if (accessMode === 'public_form') {
      setCurrentUser({
        id: 'user-cpc-public',
        name: 'Coordenador de CPC (Público)',
        email: 'cpc.publico@redcap.org',
        role: 'Digitador',
        permissions: {
          canViewDashboard: false,
          canInsertData: true,
          canEditData: false,
          canDeleteData: false,
          canExportPDF: false,
          canViewAuditTrail: false,
        }
      });
    } else {
      setCurrentUser(USER_PROFILES[selectedRole]);
    }
  }, [selectedRole, accessMode]);

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
    if (accessMode === 'public_form') {
      setFormSubmitted(true);
    } else {
      setCurrentTab('records');
    }
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

  if (accessMode === null) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Hero Panel (Decorative / Info) */}
          <div className="w-full md:w-5/12 bg-[#1E293B] p-8 sm:p-12 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/50 to-[#0F172A] z-0" />
            
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Database size={24} className="text-white" />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black tracking-widest uppercase text-blue-400 font-mono">REDCap Sync v1.0</span>
                <h2 className="text-2xl font-black tracking-tight leading-tight">
                  Mapeamento Nacional de CPCs
                </h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Plataforma unificada para gerenciamento, monitoramento e inserção de dados de conformidade dos Centros de Pesquisa Clínica no Brasil.
              </p>
            </div>
            
            <div className="relative z-10 pt-12 text-[10px] text-slate-500 font-bold border-t border-slate-800 mt-8">
              Conformidade total com GCP, LGPD e regulamentações de pesquisa clínica.
            </div>
          </div>

          {/* Right Action Panel */}
          <div className="w-full md:w-7/12 p-8 sm:p-12 flex flex-col justify-center space-y-8 bg-white">
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Portal de Acesso</h3>
              <p className="text-xs text-slate-500 font-semibold leading-normal">Selecione seu perfil de atividade para prosseguir para a área correspondente.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Option 1: Project Coordinators */}
              <button
                onClick={() => setAccessMode('portal')}
                className="group flex items-start gap-4 p-5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/10 text-left transition-all duration-300 hover:shadow-lg hover:shadow-slate-100"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Shield size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">Portal de Gestão (Coordenação Geral)</h4>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                    Acesso completo ao painel de métricas, listas de centros de pesquisa, análises consolidadas e trilha de auditoria de conformidade.
                  </p>
                </div>
              </button>

              {/* Option 2: CPC Coordinators */}
              <button
                onClick={() => {
                  setAccessMode('public_form');
                  setFormSubmitted(false);
                }}
                className="group flex items-start gap-4 p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/10 text-left transition-all duration-300 hover:shadow-lg hover:shadow-slate-100"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <ClipboardEdit size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-800 group-hover:text-emerald-600 transition-colors">Cadastro do Centro de Pesquisa (Público)</h4>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                    Canal direto para coordenadores locais inserirem ou atualizarem as informações estruturais do seu CPC no banco de dados.
                  </p>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (accessMode === 'public_form' && formSubmitted) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-12 text-center space-y-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <ClipboardCheck size={32} />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Cadastro Enviado com Sucesso!</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold max-w-sm mx-auto">
              As informações do seu Centro de Pesquisa Clínica (CPC) foram transmitidas e integradas ao banco de dados com sucesso.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left text-[11px] text-slate-500 space-y-2 leading-relaxed">
            <div className="flex items-center gap-2 text-slate-700 font-black mb-1">
              <Shield size={14} className="text-emerald-600" />
              <span>Garantia de Conformidade Regulatória</span>
            </div>
            <p className="font-semibold">
              Este envio foi registrado sob as diretrizes de Boas Práticas Clínicas (GCP) e regulamentos de proteção de dados (LGPD). Um log correspondente de auditoria de inserção de dados foi anexado ao sistema central para fins de registro e rastreamento.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => setFormSubmitted(false)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 px-6 rounded-xl transition-all shadow-md shadow-emerald-600/10 hover:shadow-lg cursor-pointer"
            >
              Realizar Novo Cadastro
            </button>
            <button
              onClick={() => {
                setAccessMode(null);
                setFormSubmitted(false);
              }}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-3.5 px-6 rounded-xl transition-all cursor-pointer"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (accessMode === 'public_form') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
        <header className="h-20 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 no-print">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAccessMode(null)}
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
              title="Voltar ao início"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-800 tracking-tight">
                Cadastro de Centro de Pesquisa (CPC)
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500 leading-none mt-1 font-bold">
                Preencha as informações estruturais de conformidade para o dicionário do projeto
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {((import.meta as any).env?.VITE_REDCAP_API_TOKEN) ? (
              <span className="text-[9px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-md uppercase tracking-wider">
                REDCap Ativo
              </span>
            ) : (
              <span className="text-[9px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded-md uppercase tracking-wider">
                REDCap Desconectado
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto w-full max-w-7xl mx-auto flex flex-col">
          <DataInsertion 
            user={currentUser}
            editingRecordId={null}
            records={records}
            onSaveRecord={handleSaveRecord}
            onCancel={() => setAccessMode(null)}
          />
        </main>

        <footer className="bg-white border-t border-slate-200 py-5 text-center text-[11px] text-slate-400 font-bold no-print">
          <p>&copy; 2026 Portal de Integração REDCap. Conformidade total com GCP, LGPD e Diretrizes de Auditoria.</p>
        </footer>
      </div>
    );
  }

  // STANDARD PORTAL ACCESS FOR COORDINATORS (accessMode === 'portal')
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
          <div className="flex flex-col gap-2 p-2 rounded-xl bg-slate-800/30 border border-slate-800/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                {currentUser.name.substring(0, 2)}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white leading-tight truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{currentUser.email}</div>
              </div>
            </div>
            
            {/* Back to gateway button */}
            <button
              onClick={() => setAccessMode(null)}
              className="mt-1 w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-all cursor-pointer"
            >
              <LogOut size={12} />
              Voltar ao Início
            </button>
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
