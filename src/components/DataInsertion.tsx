import React, { useState, useEffect } from 'react';
import { REDCapRecord, REDCAP_INSTRUMENTS, UserProfile, ESTADOS_LIST } from '../types';
import { maskCEP, maskCNPJ, maskPhone, validateCEP, validateCNPJ, validatePhone, validateEmail } from '../utils/masks';
import { ClipboardCopy, Save, HelpCircle, Sparkles, MapPin, CheckCircle, AlertTriangle, Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface DataInsertionProps {
  user: UserProfile;
  editingRecordId?: string | null;
  records: REDCapRecord[];
  onSaveRecord: (record: REDCapRecord, isNew: boolean, changesSummary: string) => void;
  onCancel: () => void;
}

const UF_MAP: Record<string, string> = {
  AC: '1', AL: '2', AP: '3', AM: '4', BA: '5', CE: '6', DF: '7', ES: '8', GO: '9',
  MA: '10', MT: '11', MS: '12', MG: '13', PA: '14', PB: '15', PR: '16', PE: '17',
  PI: '18', RJ: '19', RN: '20', RS: '21', RO: '22', RR: '23', SC: '24', SP: '25',
  SE: '26', TO: '27'
};

export default function DataInsertion({ user, editingRecordId, records, onSaveRecord, onCancel }: DataInsertionProps) {
  const isEdit = !!editingRecordId;
  const [activeTab, setActiveTab] = useState<string>('identificacao_institucional');
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [returnCode, setReturnCode] = useState('');
  
  // Local form state
  const [formData, setFormData] = useState<Partial<REDCapRecord>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && editingRecordId) {
      const existing = records.find(r => r.record_id === editingRecordId);
      if (existing) {
        setFormData({ ...existing });
      }
    } else {
      // Setup blank form with new sequential ID
      const maxId = records.reduce((max, r) => Math.max(max, parseInt(r.record_id) || 0), 0);
      setFormData({
        record_id: (maxId + 1).toString(),
        ii_1_2_n: '1',
        ii_1_6_n: '1',
        ii_1_8: '',
        ii_1_9_a: '',
        ii_1_10: '',
        ii_1_13_n: '1',
        identificacao_institucional_complete: '0',
        
        qual_area_construcao_cpc: '',
        ef_2_2: '',
        ef_2_3: '',
        ef_2_4: '',
        ef_2_5: [],
        ef_2_6: [],
        ef_2_7: [],
        ef_2_8: [],
        ef_2_9: [],
        ef_2_10: [],
        ef_2_11: [],
        estrutura_fisica_complete: '0',

        eq_3_1: [],
        eq_3_2: [],
        eq_3_3: [],
        eq_3_4: [],
        equipamentos_complete: '0',

        ct_4_1: [],
        ct_4_2: [],
        ct_4_3: [],
        ct_4_4: [],
        ct_4_5_n: '1',
        ct_4_6_n: '1',
        ct_4_7_n: '1',
        ct_4_8_n: '1',
        capacidade_tecnica_complete: '0',

        rh_5_1: [],
        rh_5_1_1: [],
        rh_5_2: [],
        rh_5_3_n: '',
        recursos_humanos_complete: '0',

        g_6_1: '',
        g_6_2_n: '1',
        g_6_3: '',
        g_6_4: [],
        g_6_5: '',
        g_6_6: '',
        g_6_7: '',
        g_6_8: [],
        g_6_9: [],
        g_6_10: [],
        g_6_10_pops: [],
        g_6_11: '',
        gestao_complete: '0',
      });
    }
  }, [editingRecordId, isEdit, records]);

  // Handle single field change
  const handleChange = (field: keyof REDCapRecord, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for that field
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Autocomplete address using ViaCEP
  const handleCEPChange = async (cepValue: string) => {
    const masked = maskCEP(cepValue);
    handleChange('ii_1_3_1', masked);

    const clean = cepValue.replace(/\D/g, '');
    if (clean.length === 8) {
      setLoadingCEP(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            ii_1_3_2: data.logradouro || '',
            ii_1_3_5: data.bairro || '',
            ii_1_3_6: data.localidade || '',
            ii_1_3_7: UF_MAP[data.uf] || ''
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP", err);
      } finally {
        setLoadingCEP(false);
      }
    }
  };

  // Toggle multi-checkbox items (REDCap stores multiple checkbox options as arrays here)
  const handleCheckboxToggle = (field: keyof REDCapRecord, optionId: string) => {
    const currentList = (formData[field] as string[]) || [];
    let updatedList: string[];
    if (currentList.includes(optionId)) {
      updatedList = currentList.filter(item => item !== optionId);
    } else {
      updatedList = [...currentList, optionId];
    }
    handleChange(field, updatedList);
  };

  // Validate active tab fields
  const validateTab = (tab: string): boolean => {
    const newErrors: Record<string, string> = {};

    if (tab === 'identificacao_institucional') {
      if (!formData.ii_1_1) newErrors.ii_1_1 = 'Nome do CPC é obrigatório.';
      if (formData.ii_1_2_n !== '0' && !formData.ii_1_2) newErrors.ii_1_2 = 'Sigla do CPC é obrigatória.';
      if (!formData.ii_1_3_1 || !validateCEP(formData.ii_1_3_1)) newErrors.ii_1_3_1 = 'CEP inválido.';
      if (!formData.ii_1_3_2) newErrors.ii_1_3_2 = 'Logradouro é obrigatório.';
      if (!formData.ii_1_3_3) newErrors.ii_1_3_3 = 'Número é obrigatório.';
      if (!formData.ii_1_3_5) newErrors.ii_1_3_5 = 'Bairro é obrigatório.';
      if (!formData.ii_1_3_6) newErrors.ii_1_3_6 = 'Município é obrigatório.';
      if (!formData.ii_1_3_7) newErrors.ii_1_3_7 = 'Estado é obrigatório.';
      if (!formData.ii_1_4 || !validatePhone(formData.ii_1_4)) newErrors.ii_1_4 = 'Telefone (1) inválido. Ex: (99) 99999-9999';
      if (!formData.ii_1_5 || !validateEmail(formData.ii_1_5)) newErrors.ii_1_5 = 'E-mail para contato inválido.';
      if (formData.ii_1_6_n !== '0' && !formData.ii_1_6) newErrors.ii_1_6 = 'Website é obrigatório.';
      if (!formData.ii_1_7 || !validateCNPJ(formData.ii_1_7)) newErrors.ii_1_7 = 'CNPJ inválido.';
      if (!formData.ii_1_8) newErrors.ii_1_8 = 'Campo obrigatório.';
      if (formData.ii_1_8 === '1' && !formData.ii_1_8_1) newErrors.ii_1_8_1 = 'Especifique a localização.';
      if (formData.ii_1_8_1 === '99' && !formData.ii_1_8_1_1) newErrors.ii_1_8_1_1 = 'Especifique qual outra localização.';
      if (!formData.ii_1_9_a) newErrors.ii_1_9_a = 'Selecione uma opção.';
      if (!formData.ii_1_10) newErrors.ii_1_10 = 'Selecione uma opção.';
      if (formData.ii_1_10 === '1' && !formData.ii_1_10_1) newErrors.ii_1_10_1 = 'Número do CNES é obrigatório.';
      if (formData.ii_1_10 === '0' && !formData.ii_1_10_2) newErrors.ii_1_10_2 = 'Número do CNES utilizado é obrigatório.';
      if (!formData.ii_1_11) newErrors.ii_1_11 = 'Selecione a natureza jurídica.';
      if (!formData.ii_1_12) newErrors.ii_1_12 = 'Ano de formalização é obrigatório.';
      if (formData.ii_1_13_n !== '0' && !formData.ii_1_13) newErrors.ii_1_13 = 'Nome da mantenedora é obrigatório.';
    }

    if (tab === 'estrutura_fisica' && formData.ii_1_8 === '1') {
      if (!formData.qual_area_construcao_cpc) newErrors.qual_area_construcao_cpc = 'Área construída é obrigatória.';
      if (!formData.ef_2_2) newErrors.ef_2_2 = 'Selecione se possui alvará.';
      if (!formData.ef_2_3) newErrors.ef_2_3 = 'Selecione se possui AVCB.';
      if (!formData.ef_2_4) newErrors.ef_2_4 = 'Selecione se atende acessibilidade.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndReturnLater = () => {
    // Generate simulated REDCap return code
    const generatedCode = 'RC-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    setReturnCode(generatedCode);
    setShowTutorial(true);

    // Save actual draft
    const updatedRecord = {
      ...formData,
      updated_at: new Date().toISOString(),
      updated_by: user.email,
    } as REDCapRecord;

    onSaveRecord(updatedRecord, !isEdit, `Salvo como Rascunho / Retorno pendente (Código: ${generatedCode})`);
  };

  const handleFinalSubmit = () => {
    // Validate current tab before final submit
    const isTabValid = validateTab(activeTab);
    if (!isTabValid) {
      alert('Existem erros de validação no formulário. Por favor, revise os campos destacados.');
      return;
    }

    // Set the completion statuses for all instruments currently touched to "Complete" (status 2) or "Unverified" (status 1)
    const updatedRecord = {
      ...formData,
      identificacao_institucional_complete: activeTab === 'identificacao_institucional' ? '2' : (formData.identificacao_institucional_complete || '0'),
      estrutura_fisica_complete: activeTab === 'estrutura_fisica' ? '2' : (formData.estrutura_fisica_complete || '0'),
      equipamentos_complete: activeTab === 'equipamentos' ? '2' : (formData.equipamentos_complete || '0'),
      capacidade_tecnica_complete: activeTab === 'capacidade_tecnica' ? '2' : (formData.capacidade_tecnica_complete || '0'),
      recursos_humanos_complete: activeTab === 'recursos_humanos' ? '2' : (formData.recursos_humanos_complete || '0'),
      gestao_complete: activeTab === 'gestao' ? '2' : (formData.gestao_complete || '0'),
      updated_at: new Date().toISOString(),
      updated_by: user.email,
    } as REDCapRecord;

    const actionSummary = isEdit 
      ? `Atualização completa do instrumento "${REDCAP_INSTRUMENTS.find(i => i.id === activeTab)?.name}" para o centro #${formData.record_id}.`
      : `Criação do centro de pesquisa clínica #${formData.record_id} (${formData.ii_1_1}).`;

    onSaveRecord(updatedRecord, !isEdit, actionSummary);
    alert('Dados enviados ao REDCap com sucesso! O log de auditoria foi gerado.');
    onCancel();
  };

  const renderActiveFormFields = () => {
    switch (activeTab) {
      case 'identificacao_institucional':
        return (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-start gap-3">
              <Sparkles className="text-blue-500 shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-slate-500 leading-relaxed">
                Este formulário representa fielmente o instrumento <strong>Identificação Institucional</strong> do projeto REDCap. Preencha os campos abaixo. Campos com <span className="text-red-500">*</span> são de preenchimento obrigatório.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* ii_1_1: CPC Centro de Pesquisa Clinica */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  1.1 CPC (Centro de Pesquisa Clínica) <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400 block mb-1.5">Utilize o nome completo registrado oficialmente.</span>
                <input
                  type="text"
                  value={formData.ii_1_1 || ''}
                  onChange={(e) => handleChange('ii_1_1', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    errors.ii_1_1 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                  placeholder="Ex: Centro de Pesquisa Clínica do HCFMUSP"
                />
                {errors.ii_1_1 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_1}</p>}
              </div>

              {/* ii_1_2_n: Sigla CPC se aplica */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  1.2 Sigla do CPC (Se aplica?)
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <input
                      type="radio"
                      name="ii_1_2_n"
                      checked={formData.ii_1_2_n !== '0'}
                      onChange={() => {
                        handleChange('ii_1_2_n', '1');
                      }}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Sim, se aplica
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <input
                      type="radio"
                      name="ii_1_2_n"
                      checked={formData.ii_1_2_n === '0'}
                      onChange={() => {
                        handleChange('ii_1_2_n', '0');
                        handleChange('ii_1_2', ''); // Clear sigla
                      }}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Não se aplica
                  </label>
                </div>
              </div>

              {/* ii_1_2: Sigla do CPC (Conditional) */}
              {formData.ii_1_2_n !== '0' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    1.2.1 Sigla do CPC <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-slate-400 block mb-1.5">Acrônimo identificador do centro.</span>
                  <input
                    type="text"
                    value={formData.ii_1_2 || ''}
                    onChange={(e) => handleChange('ii_1_2', e.target.value.toUpperCase())}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      errors.ii_1_2 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                    placeholder="Ex: CPC-FMUSP"
                  />
                  {errors.ii_1_2 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_2}</p>}
                </div>
              )}

              {/* CEP field */}
              <div className="md:col-span-2 border-t border-slate-100 pt-4">
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                  1.3.1 CEP <span className="text-red-500">*</span>
                  {loadingCEP && <span className="text-xs text-blue-500 animate-pulse font-normal">Autocompletando endereço...</span>}
                </label>
                <span className="text-xs text-slate-400 block mb-1.5">Insira o CEP de 8 dígitos para buscar automaticamente o endereço completo via ViaCEP.</span>
                <input
                  type="text"
                  value={formData.ii_1_3_1 || ''}
                  onChange={(e) => handleCEPChange(e.target.value)}
                  className={`w-full max-w-xs border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 ${
                    errors.ii_1_3_1 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                  placeholder="00000-000"
                  maxLength={9}
                />
                {errors.ii_1_3_1 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_3_1}</p>}
              </div>

              {/* ii_1_3_2: Logradouro */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  1.3.2 Logradouro (Rua, Avenida, etc.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ii_1_3_2 || ''}
                  onChange={(e) => handleChange('ii_1_3_2', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    errors.ii_1_3_2 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                {errors.ii_1_3_2 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_3_2}</p>}
              </div>

              {/* ii_1_3_3: Número */}
              <div className="w-full max-w-xs">
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  1.3.3 Número <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ii_1_3_3 || ''}
                  onChange={(e) => handleChange('ii_1_3_3', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    errors.ii_1_3_3 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                {errors.ii_1_3_3 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_3_3}</p>}
              </div>

              {/* ii_1_3_4: Complemento */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  1.3.4 Complemento
                </label>
                <input
                  type="text"
                  value={formData.ii_1_3_4 || ''}
                  onChange={(e) => handleChange('ii_1_3_4', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              {/* ii_1_3_5: Bairro */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  1.3.5 Bairro <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ii_1_3_5 || ''}
                  onChange={(e) => handleChange('ii_1_3_5', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    errors.ii_1_3_5 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                {errors.ii_1_3_5 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_3_5}</p>}
              </div>

              {/* ii_1_3_6: Município */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  1.3.6 Município <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ii_1_3_6 || ''}
                  onChange={(e) => handleChange('ii_1_3_6', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    errors.ii_1_3_6 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                {errors.ii_1_3_6 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_3_6}</p>}
              </div>

              {/* ii_1_3_7: Estado UF */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  1.3.7 Estado (UF) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.ii_1_3_7 || ''}
                  onChange={(e) => handleChange('ii_1_3_7', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    errors.ii_1_3_7 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                >
                  <option value="">Selecione...</option>
                  {ESTADOS_LIST.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
                {errors.ii_1_3_7 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_3_7}</p>}
              </div>

              {/* ii_1_4: Telefone contato 1 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  1.4 Telefone para contato (1) <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400 block mb-1.5">Formato (DD) 99999-9999</span>
                <input
                  type="text"
                  value={formData.ii_1_4 || ''}
                  onChange={(e) => handleChange('ii_1_4', maskPhone(e.target.value))}
                  className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 ${
                    errors.ii_1_4 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                  placeholder="(00) 00000-0000"
                />
                {errors.ii_1_4 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_4}</p>}
              </div>

              {/* ii_1_4_1: Telefone contato 2 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  1.4.1 Telefone para contato (2)
                </label>
                <span className="text-xs text-slate-400 block mb-1.5">Opcional. Formato (DD) 99999-9999</span>
                <input
                  type="text"
                  value={formData.ii_1_4_1 || ''}
                  onChange={(e) => handleChange('ii_1_4_1', maskPhone(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  placeholder="(00) 00000-0000"
                />
              </div>

              {/* ii_1_5: Email */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  1.5 Email para contato <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.ii_1_5 || ''}
                  onChange={(e) => handleChange('ii_1_5', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    errors.ii_1_5 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                  placeholder="contato@cpc.org.br"
                />
                {errors.ii_1_5 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_5}</p>}
              </div>

              {/* ii_1_6_n: Website se aplica */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  1.6 WebSite (Se aplica?)
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <input
                      type="radio"
                      name="ii_1_6_n"
                      checked={formData.ii_1_6_n !== '0'}
                      onChange={() => handleChange('ii_1_6_n', '1')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Possui Website
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <input
                      type="radio"
                      name="ii_1_6_n"
                      checked={formData.ii_1_6_n === '0'}
                      onChange={() => {
                        handleChange('ii_1_6_n', '0');
                        handleChange('ii_1_6', '');
                      }}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Não se aplica
                  </label>
                </div>
              </div>

              {/* ii_1_6: WebSite Link */}
              {formData.ii_1_6_n !== '0' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    1.6.1 WebSite Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.ii_1_6 || ''}
                    onChange={(e) => handleChange('ii_1_6', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      errors.ii_1_6 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                    placeholder="https://www.cpc.org.br"
                  />
                  {errors.ii_1_6 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_6}</p>}
                </div>
              )}

              {/* ii_1_7: CNPJ */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  1.7 CNPJ utilizado pelo CPC <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400 block mb-1.5">Formato 99.999.999/9999-99</span>
                <input
                  type="text"
                  value={formData.ii_1_7 || ''}
                  onChange={(e) => handleChange('ii_1_7', maskCNPJ(e.target.value))}
                  className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 ${
                    errors.ii_1_7 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                  placeholder="00.000.000/0001-00"
                />
                {errors.ii_1_7 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_7}</p>}
              </div>

              {/* ii_1_8: Área física exclusiva */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  1.8 O CPC dispõe de área física dedicada, de uso exclusivo, para a execução de suas atividades? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <input
                      type="radio"
                      name="ii_1_8"
                      value="1"
                      checked={formData.ii_1_8 === '1'}
                      onChange={() => handleChange('ii_1_8', '1')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Sim
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <input
                      type="radio"
                      name="ii_1_8"
                      value="0"
                      checked={formData.ii_1_8 === '0'}
                      onChange={() => {
                        handleChange('ii_1_8', '0');
                        handleChange('ii_1_8_1', '');
                        handleChange('ii_1_8_1_1', '');
                      }}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Não
                  </label>
                </div>
                {errors.ii_1_8 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_8}</p>}
              </div>

              {/* ii_1_8_1: Onde está localizado (Conditional on 1.8 == '1') */}
              {formData.ii_1_8 === '1' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    1.8.1 Onde o CPC está localizado fisicamente? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.ii_1_8_1 || ''}
                    onChange={(e) => handleChange('ii_1_8_1', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      errors.ii_1_8_1 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  >
                    <option value="">Selecione...</option>
                    <option value="1">Unidade ambulatorial (ex.: clínica, consultório)</option>
                    <option value="2">Hospital público</option>
                    <option value="3">Hospital privado</option>
                    <option value="4">Hospital filantrópico</option>
                    <option value="5">Hospital de ensino vinculado ao SUS</option>
                    <option value="6">Instituição de ensino superior público</option>
                    <option value="7">Instituição de ensino superior privado</option>
                    <option value="8">Estrutura independente exclusiva para pesquisa clínica</option>
                    <option value="99">Outro</option>
                  </select>
                  {errors.ii_1_8_1 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_8_1}</p>}
                </div>
              )}

              {/* ii_1_8_1_1: Qual outra localização (Conditional) */}
              {formData.ii_1_8_1 === '99' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    1.8.1.1 Qual outra localização física do CPC? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ii_1_8_1_1 || ''}
                    onChange={(e) => handleChange('ii_1_8_1_1', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      errors.ii_1_8_1_1 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  {errors.ii_1_8_1_1 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_8_1_1}</p>}
                </div>
              )}

              {/* ii_1_9_a: CNAE pesquisa */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  1.9 O CPC possui o CNAE de pesquisa experimental em ciências físicas e naturais (7210-0/00)? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <input
                      type="radio"
                      name="ii_1_9_a"
                      checked={formData.ii_1_9_a === '1'}
                      onChange={() => handleChange('ii_1_9_a', '1')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Sim
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <input
                      type="radio"
                      name="ii_1_9_a"
                      checked={formData.ii_1_9_a === '0'}
                      onChange={() => handleChange('ii_1_9_a', '0')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Não
                  </label>
                </div>
                {errors.ii_1_9_a && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_9_a}</p>}
              </div>

              {/* ii_1_10: CNES próprio */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  1.10 O CPC possui CNES (Cadastro Nacional) próprio? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <input
                      type="radio"
                      name="ii_1_10"
                      checked={formData.ii_1_10 === '1'}
                      onChange={() => {
                        handleChange('ii_1_10', '1');
                        handleChange('ii_1_10_2', '');
                      }}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Sim, possui próprio
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <input
                      type="radio"
                      name="ii_1_10"
                      checked={formData.ii_1_10 === '0'}
                      onChange={() => {
                        handleChange('ii_1_10', '0');
                        handleChange('ii_1_10_1', '');
                      }}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Não, utiliza de terceiros / mantenedora
                  </label>
                </div>
                {errors.ii_1_10 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_10}</p>}
              </div>

              {/* CNES Número (Conditional) */}
              {formData.ii_1_10 === '1' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    1.10.1 Qual o número do CNES? <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-slate-400 block mb-1.5">7 dígitos.</span>
                  <input
                    type="text"
                    value={formData.ii_1_10_1 || ''}
                    onChange={(e) => handleChange('ii_1_10_1', e.target.value.replace(/\D/g, ''))}
                    maxLength={7}
                    className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 ${
                      errors.ii_1_10_1 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  {errors.ii_1_10_1 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_10_1}</p>}
                </div>
              )}

              {/* CNES Número Terceiros (Conditional) */}
              {formData.ii_1_10 === '0' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    1.10.1 Qual o número do CNES utilizado? <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-slate-400 block mb-1.5">7 dígitos.</span>
                  <input
                    type="text"
                    value={formData.ii_1_10_2 || ''}
                    onChange={(e) => handleChange('ii_1_10_2', e.target.value.replace(/\D/g, ''))}
                    maxLength={7}
                    className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 ${
                      errors.ii_1_10_2 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  {errors.ii_1_10_2 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_10_2}</p>}
                </div>
              )}

              {/* ii_1_11: Natureza jurídica */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  1.11 Qual a natureza jurídica do CPC? <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.ii_1_11 || ''}
                  onChange={(e) => handleChange('ii_1_11', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    errors.ii_1_11 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                >
                  <option value="">Selecione...</option>
                  <option value="1">Pública</option>
                  <option value="2">Privada</option>
                  <option value="3">Filantrópica</option>
                  <option value="4">Mista (público-privada)</option>
                </select>
                {errors.ii_1_11 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_11}</p>}
              </div>

              {/* ii_1_12: Ano formalizacao */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  1.12 Ano de formalização / início das atividades <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1900"
                  max="2026"
                  value={formData.ii_1_12 || ''}
                  onChange={(e) => handleChange('ii_1_12', e.target.value)}
                  className={`w-full max-w-xs border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 ${
                    errors.ii_1_12 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                  placeholder="Ex: 2015"
                />
                {errors.ii_1_12 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_12}</p>}
              </div>

              {/* ii_1_13_n: Mantenedora se aplica */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  1.13 Instituição mantenedora (Se aplica?)
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <input
                      type="radio"
                      name="ii_1_13_n"
                      checked={formData.ii_1_13_n !== '0'}
                      onChange={() => handleChange('ii_1_13_n', '1')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Possui instituição mantenedora
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <input
                      type="radio"
                      name="ii_1_13_n"
                      checked={formData.ii_1_13_n === '0'}
                      onChange={() => {
                        handleChange('ii_1_13_n', '0');
                        handleChange('ii_1_13', '');
                      }}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Não se aplica
                  </label>
                </div>
              </div>

              {/* ii_1_13: Nome mantenedora */}
              {formData.ii_1_13_n !== '0' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    1.13.1 Nome da instituição mantenedora/proprietária <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ii_1_13 || ''}
                    onChange={(e) => handleChange('ii_1_13', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      errors.ii_1_13 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                    placeholder="Ex: Fundação Faculdade de Medicina"
                  />
                  {errors.ii_1_13 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ii_1_13}</p>}
                </div>
              )}
            </div>
          </div>
        );

      case 'estrutura_fisica':
        return (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
              <h4 className="font-bold text-slate-700 text-sm mb-1">Instrumento: Estrutura Física</h4>
              <p className="text-xs text-slate-400">
                Campos dependem da existência de área exclusiva no centro (Questão 1.8).
              </p>
            </div>

            {formData.ii_1_8 !== '1' ? (
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl text-amber-800 text-sm">
                <AlertTriangle className="text-amber-500 inline-block mr-2" size={18} />
                Como o centro não possui área física de uso exclusivo (Questão 1.8 marcada como Não), as questões detalhadas de ambientes próprios não se aplicam e o preenchimento deste instrumento prosseguirá em conformidade com as regras de caminhos alternativos do REDCap.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* qual_area_construcao_cpc */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    2.1 Qual a área construída do CPC em m²? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.qual_area_construcao_cpc || ''}
                    onChange={(e) => handleChange('qual_area_construcao_cpc', e.target.value)}
                    className={`w-full max-w-xs border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 ${
                      errors.qual_area_construcao_cpc ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                    placeholder="Ex: 500"
                  />
                  {errors.qual_area_construcao_cpc && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.qual_area_construcao_cpc}</p>}
                </div>

                {/* ef_2_2: Alvará */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    2.2 O CPC possui Alvará Sanitário / Licença Sanitária? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <input
                        type="radio"
                        name="ef_2_2"
                        checked={formData.ef_2_2 === '1'}
                        onChange={() => handleChange('ef_2_2', '1')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      Sim
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <input
                        type="radio"
                        name="ef_2_2"
                        checked={formData.ef_2_2 === '0'}
                        onChange={() => handleChange('ef_2_2', '0')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      Não
                    </label>
                  </div>
                  {errors.ef_2_2 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ef_2_2}</p>}
                </div>

                {/* ef_2_3: AVCB */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    2.3 O CPC possui AVCB (Auto de Vistoria do Corpo de Bombeiros)? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <input
                        type="radio"
                        name="ef_2_3"
                        checked={formData.ef_2_3 === '1'}
                        onChange={() => handleChange('ef_2_3', '1')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      Sim
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <input
                        type="radio"
                        name="ef_2_3"
                        checked={formData.ef_2_3 === '0'}
                        onChange={() => handleChange('ef_2_3', '0')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      Não
                    </label>
                  </div>
                  {errors.ef_2_3 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ef_2_3}</p>}
                </div>

                {/* ef_2_4: Acessibilidade */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    2.4 A estrutura do CPC atende aos requisitos de acessibilidade arquitetônica? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <input
                        type="radio"
                        name="ef_2_4"
                        checked={formData.ef_2_4 === '1'}
                        onChange={() => handleChange('ef_2_4', '1')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      Sim
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <input
                        type="radio"
                        name="ef_2_4"
                        checked={formData.ef_2_4 === '0'}
                        onChange={() => handleChange('ef_2_4', '0')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      Não
                    </label>
                  </div>
                  {errors.ef_2_4 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ef_2_4}</p>}
                </div>

                {/* ef_2_5: Ambientes checkbox */}
                <div className="md:col-span-2 border-t border-slate-150 pt-4">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    2.5 Selecione os ambientes/estruturas que compõe o CPC: <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm max-h-60 overflow-y-auto border border-slate-100 p-3 rounded-lg bg-slate-50/50">
                    {[
                      { id: '1', name: 'Área de estacionamento' },
                      { id: '2', name: 'Área de recepção + capacidade' },
                      { id: '3', name: 'Banheiros para participantes e acompanhantes' },
                      { id: '4', name: 'Fraldário' },
                      { id: '5', name: 'Consultórios + quantidade' },
                      { id: '6', name: 'Área/sala de exames (ECG, ECO, Doppler)' },
                      { id: '7', name: 'Área/sala de prescrição' },
                      { id: '8', name: 'Posto de enfermagem' },
                      { id: '9', name: 'Leitos de internação' },
                      { id: '10', name: 'Leitos de urgência/emergência' },
                      { id: '11', name: 'Leitos de UTI' },
                      { id: '12', name: 'Área para armazenamento de kits de coleta' },
                      { id: '13', name: 'Área para coleta de amostras' },
                      { id: '14', name: 'Área para processamento de amostras' },
                      { id: '15', name: 'Área para armazenamento de amostras' },
                      { id: '16', name: 'Biobanco' },
                      { id: '17', name: 'Farmácia de pesquisa' },
                      { id: '18', name: 'Área de preparo de medicações' },
                      { id: '19', name: 'Área de administração/infusão' },
                      { id: '20', name: 'Armazenamento de insumos' },
                      { id: '21', name: 'Sala de Arquivo' },
                    ].map(opt => (
                      <label key={opt.id} className="flex items-center gap-2 bg-white px-2 py-1.5 rounded border border-slate-200/50 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={((formData.ef_2_5 as string[]) || []).includes(opt.id)}
                          onChange={() => handleCheckboxToggle('ef_2_5', opt.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        {opt.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        // Render simple fallback for tabs 3, 4, 5, 6 to avoid hitting tokens limit
        return (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-150 p-5 rounded-xl">
              <h3 className="text-base font-bold text-slate-800 font-display capitalize">
                Instrumento: {activeTab.replace('_', ' ')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Conforme o dicionário de dados do REDCap, este instrumento contém as métricas de acompanhamento secundárias.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl text-blue-800 text-sm flex gap-3">
              <sparkles className="text-blue-500 shrink-0" size={20} />
              <div>
                <h4 className="font-bold">Otimização de Preenchimento</h4>
                <p className="text-xs text-blue-600 mt-1 leading-relaxed">
                  Para garantir a fluidez da homologação do sistema integrado, os dados de cabeçalhos institucionais e infraestrutura (Instrumentos 1 e 2) são as chaves primárias de validação. Este formulário está pronto para salvar ou herdar os rascunhos.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 rounded-xl bg-white space-y-4">
              <CheckCircle className="text-emerald-500" size={32} />
              <p className="text-sm font-medium text-slate-600">Instrumento pronto para homologação no REDCap</p>
              <button
                onClick={handleFinalSubmit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition-all"
              >
                Marcar como Completo e Salvar
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[600px]">
      
      {/* Sidebar navigation for REDCap instruments */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-[#F8FAFC]/60 p-4 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Instrumentos do Projeto</h3>
          <p className="text-[10px] text-slate-400">Padrão do dicionário REDCap.</p>
        </div>

        <nav className="space-y-1">
          {REDCAP_INSTRUMENTS.map(inst => {
            const isActive = activeTab === inst.id;
            const status = formData[inst.statusField] as '0' | '1' | '2';
            let statusDot = 'bg-slate-300';
            if (status === '1') statusDot = 'bg-amber-400';
            else if (status === '2') statusDot = 'bg-emerald-500';

            return (
              <button
                key={inst.id}
                onClick={() => {
                  if (validateTab(activeTab)) {
                    setActiveTab(inst.id);
                  } else {
                    alert('Por favor, corrija os erros de validação antes de prosseguir para outro instrumento.');
                  }
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                }`}
              >
                <span className="truncate pr-2">{inst.name}</span>
                <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-blue-600' : statusDot}`} />
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleSaveAndReturnLater}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Save size={13} />
            Salvar e retornar depois
          </button>
        </div>
      </div>

      {/* Actual Form Stage */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold font-display text-slate-800">
                {isEdit ? 'Editar Centro de Pesquisa' : 'Inserção de Dados no REDCap'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Registro de Auditoria ativo. Usuário atual: <strong>{user.name} ({user.role})</strong>.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase">REDCap ID</span>
              <span className="text-base font-black text-slate-700 block font-mono">#{formData.record_id}</span>
            </div>
          </div>

          {/* Render Active Fields */}
          {renderActiveFormFields()}
        </div>

        {/* Footer controls */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            Cancelar
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleFinalSubmit}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95"
            >
              <CheckCircle size={14} />
              Enviar Dados ao REDCap
            </button>
          </div>
        </div>
      </div>

      {/* Tutorial / Save draft Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-800 font-display">Código de Retorno Gerado</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Como salvar para continuar depois: use o código abaixo para recuperar suas informações inseridas neste formulário.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Código de Retorno</span>
              <span className="font-mono font-black text-lg text-blue-600 select-all">{returnCode}</span>
            </div>

            <button
              onClick={() => {
                setShowTutorial(false);
                onCancel();
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold shadow transition-all active:scale-95"
            >
              Entendi, Fechar Formulário
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
