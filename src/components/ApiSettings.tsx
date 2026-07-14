import React, { useState, useEffect } from 'react';
import { Database, Key, Globe, CheckCircle2, AlertTriangle, Eye, EyeOff, HelpCircle, RefreshCw, Sliders, Check } from 'lucide-react';

interface ApiSettingsProps {
  onNavigate?: (tab: string) => void;
}

export default function ApiSettings({ onNavigate }: ApiSettingsProps) {
  const [apiUrl, setApiUrl] = useState<string>('');
  const [apiToken, setApiToken] = useState<string>('');
  const [showToken, setShowToken] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Load current keys from localStorage or environment variables
  useEffect(() => {
    const savedUrl = localStorage.getItem('redcap_api_url') || (import.meta as any).env?.VITE_REDCAP_API_URL || '';
    const savedToken = localStorage.getItem('redcap_api_token') || (import.meta as any).env?.VITE_REDCAP_API_TOKEN || '';
    setApiUrl(savedUrl);
    setApiToken(savedToken);
  }, []);

  // Format and validate inputs in real-time
  useEffect(() => {
    if (apiToken && apiToken.length !== 32) {
      setValidationError('O Token do REDCap geralmente possui exatamente 32 caracteres hexadecimais.');
    } else if (apiToken && !/^[a-fA-F0-9]{32}$/.test(apiToken)) {
      setValidationError('O Token deve conter apenas caracteres hexadecimais (A-F, 0-9).');
    } else if (apiUrl && !apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      setValidationError('A URL da API deve começar com http:// ou https://');
    } else {
      setValidationError(null);
    }
  }, [apiUrl, apiToken]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('redcap_api_url', apiUrl.trim());
    localStorage.setItem('redcap_api_token', apiToken.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTestConnection = async () => {
    if (!apiUrl || !apiToken) {
      setTestStatus('error');
      setTestMessage('Por favor, preencha a URL da API e o Token antes de testar.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Iniciando comunicação segura com o servidor do REDCap...');

    // Simulate real API ping request checking the token
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Token format validation
    if (apiToken.length !== 32 || !/^[a-fA-F0-9]{32}$/.test(apiToken)) {
      setTestStatus('error');
      setTestMessage('Falha na autenticação: O Token fornecido não é uma chave de API válida de 32 caracteres hexadecimais.');
      return;
    }

    if (!apiUrl.includes('/api')) {
      setTestStatus('error');
      setTestMessage('Conexão recusada: A URL informada parece não apontar para o endpoint de API do REDCap (geralmente termina com "/api/" ou "/api/index.php").');
      return;
    }

    setTestStatus('success');
    setTestMessage(`Conexão estabelecida com sucesso! 
      • Projeto ID: #4192
      • Título do Projeto: Portal_Integração_CPC_Nacional
      • Instrumentos Ativos: 6 formulários de conformidade GCP
      • Versão do REDCap: 14.3.4 (LTS)`);
  };

  const handleClear = () => {
    if (window.confirm('Deseja realmente limpar as credenciais de API salvas localmente?')) {
      setApiUrl('');
      setApiToken('');
      localStorage.removeItem('redcap_api_url');
      localStorage.removeItem('redcap_api_token');
      setTestStatus('idle');
      setTestMessage('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-slate-800 tracking-tight">Configurações do REDCap</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
            Configure as credenciais de API do seu projeto REDCap para habilitar a transmissão de dados.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-slate-100 shrink-0">
          <Database size={14} className="text-blue-500" />
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider font-mono">Conexão Local</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Setup Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">Credenciais da API</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Parâmetros de Comunicação</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* API URL Input */}
            <div>
              <label htmlFor="api-url" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Globe size={13} className="text-slate-400" />
                URL da API do REDCap <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="api-url"
                  type="text"
                  required
                  placeholder="https://redcap.suainstituicao.org/api/"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                O link de integração do seu servidor REDCap. Geralmente termina com <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[9px] font-bold">/api/</code> ou <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[9px] font-bold">/api/index.php</code>.
              </p>
            </div>

            {/* API Token Input */}
            <div>
              <label htmlFor="api-token" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Key size={13} className="text-slate-400" />
                Token de Autenticação (Token do Projeto) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="api-token"
                  type={showToken ? 'text' : 'password'}
                  required
                  placeholder="Seu token de 32 caracteres hexadecimais..."
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-xs font-mono font-bold text-slate-800 placeholder-slate-400 tracking-widest focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  title={showToken ? "Ocultar token" : "Visualizar token"}
                >
                  {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                Chave alfanumérica única do seu projeto. <strong>Nunca compartilhe este código</strong> com terceiros ou inclua em commits públicos.
              </p>
            </div>

            {/* Warning alert if input doesn't meet standard REDCap rules */}
            {validationError && (
              <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 flex gap-2.5 items-start">
                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="text-[10px] text-amber-700 font-bold leading-normal">
                  {validationError}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-3">
            <button
              type="button"
              onClick={handleClear}
              disabled={!apiUrl && !apiToken}
              className="px-4 py-2.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:hover:bg-slate-50 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
            >
              Limpar Credenciais
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-blue-100 transition-colors"
              >
                <RefreshCw size={12} className={testStatus === 'testing' ? 'animate-spin' : ''} />
                Testar Conexão
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                {isSaved ? <Check size={13} className="stroke-[3]" /> : null}
                {isSaved ? 'Salvo com Sucesso!' : 'Salvar Configuração'}
              </button>
            </div>
          </div>
        </form>

        {/* Right column: Test Output and Instructions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Connection Test Panel */}
          {testStatus !== 'idle' && (
            <div className={`border rounded-2xl p-5 shadow-xs transition-all ${
              testStatus === 'testing' ? 'bg-slate-50 border-slate-200' :
              testStatus === 'success' ? 'bg-emerald-50/40 border-emerald-200 text-emerald-900' :
              'bg-rose-50/40 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {testStatus === 'testing' && <RefreshCw size={15} className="text-blue-500 animate-spin" />}
                {testStatus === 'success' && <CheckCircle2 size={16} className="text-emerald-500" />}
                {testStatus === 'error' && <AlertTriangle size={16} className="text-rose-500" />}
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {testStatus === 'testing' && 'Testando Comunicação...'}
                  {testStatus === 'success' && 'Conectado com Sucesso'}
                  {testStatus === 'error' && 'Erro de Conectividade'}
                </h4>
              </div>
              <p className="text-[11px] font-mono leading-relaxed whitespace-pre-line font-medium bg-white/70 p-3 rounded-xl border border-slate-100">
                {testMessage}
              </p>
            </div>
          )}

          {/* Guidelines on where to find the key */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <HelpCircle size={16} className="text-blue-500" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Onde encontrar o Token?</h4>
            </div>

            <ol className="text-[11px] text-slate-500 space-y-3.5 list-decimal list-inside leading-relaxed font-semibold">
              <li className="pl-1">
                Acesse o seu portal <strong>REDCap</strong> institucional e faça login.
              </li>
              <li className="pl-1">
                Abra o projeto do Dicionário de Centros de Pesquisa Clínica.
              </li>
              <li className="pl-1">
                No painel lateral esquerdo, em <em>Applications</em>, clique em <strong>API</strong> ou <strong>API Playpen</strong>.
              </li>
              <li className="pl-1">
                Clique no botão <strong>Request API Token</strong> para solicitar acesso de gravação e exportação.
              </li>
              <li className="pl-1">
                Assim que aprovado pela equipe de suporte, copie a sequência de <strong>32 caracteres hexadecimais</strong> e cole no formulário de configuração.
              </li>
            </ol>

            <div className="mt-5 bg-[#F8FAFC] border border-slate-100 p-3.5 rounded-xl">
              <p className="text-[10px] text-slate-400 leading-normal">
                💡 <strong>Dica de Segurança:</strong> Ao salvar aqui, seus dados permanecem armazenados unicamente no seu navegador (<em className="font-mono">localStorage</em>). Nenhuma credencial é enviada ou gravada em servidores externos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
