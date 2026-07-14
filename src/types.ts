export type UserRole = 'Administrador' | 'Coordenador' | 'Pesquisador' | 'Digitador';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: {
    canViewDashboard: boolean;
    canInsertData: boolean;
    canEditData: boolean;
    canDeleteData: boolean;
    canExportPDF: boolean;
    canViewAuditTrail: boolean;
  };
}

export const USER_PROFILES: Record<UserRole, UserProfile> = {
  Administrador: {
    id: 'user-admin',
    name: 'Dra. Alice Silva',
    email: 'alice.silva@cpc.org.br',
    role: 'Administrador',
    permissions: {
      canViewDashboard: true,
      canInsertData: true,
      canEditData: true,
      canDeleteData: true,
      canExportPDF: true,
      canViewAuditTrail: true,
    },
  },
  Coordenador: {
    id: 'user-coord',
    name: 'Dr. Bruno Santos',
    email: 'bruno.santos@cpc.org.br',
    role: 'Coordenador',
    permissions: {
      canViewDashboard: true,
      canInsertData: true,
      canEditData: true,
      canDeleteData: false,
      canExportPDF: true,
      canViewAuditTrail: true,
    },
  },
  Pesquisador: {
    id: 'user-pesq',
    name: 'Dr. Carlos Souza',
    email: 'carlos.souza@cpc.org.br',
    role: 'Pesquisador',
    permissions: {
      canViewDashboard: true,
      canInsertData: true,
      canEditData: true,
      canDeleteData: false,
      canExportPDF: false,
      canViewAuditTrail: false,
    },
  },
  Digitador: {
    id: 'user-dig',
    name: 'Eduardo Lima',
    email: 'eduardo.lima@cpc.org.br',
    role: 'Digitador',
    permissions: {
      canViewDashboard: false,
      canInsertData: true,
      canEditData: false,
      canDeleteData: false,
      canExportPDF: false,
      canViewAuditTrail: false,
    },
  },
};

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  recordId: string;
  instrument?: string;
  details: string;
}

// Complete record representing the nested instruments of REDCap CPC schema
export interface REDCapRecord {
  record_id: string;
  
  // Instrument 1: Identificacao Institucional
  ii_1_1: string; // CPC Nome
  ii_1_2: string; // Sigla CPC
  ii_1_2_n: string; // '0' if não se aplica, '1' if se aplica
  ii_1_3_1: string; // CEP
  ii_1_3_2: string; // Logradouro
  ii_1_3_3: string; // Número
  ii_1_3_4: string; // Complemento
  ii_1_3_5: string; // Bairro
  ii_1_3_6: string; // Município
  ii_1_3_7: string; // Estado (UF) code '1' to '27'
  ii_1_4: string; // Telefone 1
  ii_1_4_1: string; // Telefone 2
  ii_1_5: string; // Email
  ii_1_6: string; // WebSite
  ii_1_6_n: string; // '0' if não se aplica, '1' if se aplica
  ii_1_7: string; // CNPJ
  ii_1_8: string; // Área física exclusiva '1' = Sim, '0' = Não
  ii_1_8_1: string; // Localização (1 to 99)
  ii_1_8_1_1: string; // Outra localização
  ii_1_9_a: string; // CNAE yesno
  ii_1_10: string; // CNES próprio yesno
  ii_1_10_1: string; // CNES num próprio
  ii_1_10_2: string; // CNES num outro
  ii_1_11: string; // Natureza jurídica (1 to 4)
  ii_1_12: string; // Ano de formalização
  ii_1_13: string; // Instituição mantenedora
  ii_1_13_n: string; // '0' if não se aplica, '1' if se aplica
  identificacao_institucional_complete: '0' | '1' | '2'; // 0=Incomplete, 1=Unverified, 2=Complete

  // Instrument 2: Estrutura Fisica
  qual_area_construcao_cpc: string; // área construída m²
  ef_2_2: string; // Alvará sanitário yesno
  ef_2_3: string; // AVCB yesno
  ef_2_4: string; // Acessibilidade yesno
  ef_2_5: string[]; // Ambientes compõe (array of ids "1" to "24", "99")
  ef_2_5_outros: string;
  ef_2_6: string[]; // Salas especialidades ("1", "2", "3", "99")
  ef_2_6_1: string;
  ef_2_7: string[]; // Ambientes equipe ("1" to "8", "99")
  ef_2_7_1: string;
  ef_2_8: string[]; // Locais sem área física ("1" to "9", "99")
  ef_2_8_outros: string;
  ef_2_9: string[]; // Ambientes equipe sem área física ("1" to "13", "99")
  ef_2_9_1: string;
  ef_2_10: string[]; // Serviços terceirizados ("1" to "10", "99")
  ef_2_10_1: string;
  ef_2_11: string[]; // Atividades descentralizadas ("1" to "10", "99")
  ef_2_11_1: string;
  estrutura_fisica_complete: '0' | '1' | '2';

  // Instrument 3: Equipamentos
  eq_3_1: string[]; // Equipamentos assistência ("1" to "14", "99")
  eq_3_1_outros: string;
  eq_3_2: string[]; // Equipamentos amostras ("1" to "10", "99")
  eq_3_2_outros: string;
  eq_3_3: string[]; // Equipamentos farmácia ("1" to "8", "99")
  eq_3_3_outros: string;
  eq_3_4: string[]; // Equipamentos suporte TI ("1" to "8", "99")
  eq_3_4_outros: string;
  equipamentos_complete: '0' | '1' | '2';

  // Instrument 4: Capacidade Tecnica
  ct_4_1: string[]; // Serviços oferecidos ("1" to "5", "99")
  ct_4_1_outros: string;
  ct_4_2: string[]; // Tipos estudos ("1" to "6", "99")
  ct_4_2_outros: string;
  ct_4_3: string[]; // Tipos produtos ("1" to "6", "99")
  ct_4_3_outros: string;
  ct_4_4: string[]; // Especialidades ("1" to "29", "99")
  ct_4_4_outros: string;
  ct_4_5: string; // Estudos industria 3 anos
  ct_4_5_n: string; // '0' if não informar, '1' if informar
  ct_4_6: string; // Estudos industria inicio
  ct_4_6_n: string; // '0' if não informar, '1' if informar
  ct_4_7: string; // Estudos investigador 3 anos
  ct_4_7_n: string; // '0' if não informar, '1' if informar
  ct_4_8: string; // Estudos investigador inicio
  ct_4_8_n: string; // '0' if não informar, '1' if informar
  capacidade_tecnica_complete: '0' | '1' | '2';

  // Instrument 5: Recursos Humanos
  rh_5_1: string[]; // Vínculo profissionais ("1", "2", "3", "99")
  rh_5_1_outros: string;
  rh_5_1_1: string[]; // Quantitativo profissionais exclusivos ("1" to "14", "99")
  rh_5_1_1_coord: string;
  rh_5_1_1_enf: string;
  rh_5_1_1_ti: string;
  rh_5_1_1_med: string;
  rh_5_1_1_amostras_bio: string;
  rh_5_1_1_prod_invest: string;
  rh_5_1_1_farm: string;
  rh_5_1_1_gproj: string;
  rh_5_1_1_gadm: string;
  rh_5_1_1_mon: string;
  rh_5_1_1_sec: string;
  rh_5_1_1_qual: string;
  rh_5_1_1_fin: string;
  rh_5_1_1_jur: string;
  rh_5_1_1_outros_1: string;
  rh_5_1_1_outros_2: string;
  rh_5_1_2: string; // '1'=Integral, '2'=Parcial, '3'=Sob demanda
  rh_5_1_3: string; // '1' to '5', '7', '99'
  rh_5_1_4: string;
  rh_5_2: string[]; // Formação ("1" to "7")
  rh_5_2_medio: string;
  rh_5_2_tec: string;
  rh_5_2_grad: string;
  rh_5_2_especializa: string;
  rh_5_2_mest: string;
  rh_5_2_dout: string;
  rh_5_2_posdoc: string;
  rh_5_3_n: string; // yesno
  rh_5_3: string; // pós quantitativo
  recursos_humanos_complete: '0' | '1' | '2';

  // Instrument 6: Gestao
  g_6_1: string; // Organograma yesno
  g_6_1_1: string; // Link
  g_6_2: string; // Tempo médio contratos
  g_6_2_n: string; // '0' if não informar, '1' if informar
  g_6_3: string; // Setor contratos ('1' to '7', '99')
  g_6_3_outros: string;
  g_6_4: string[]; // Fontes recursos ('1' to '6', '99')
  g_6_4_outros: string;
  g_6_5: string; // Planejamento estratégico ('1', '2', '3')
  g_6_6: string; // Sistema eletrônico yesno
  g_6_7: string; // Modalidade arquivamento ('1'=Físico, '2'=Digital, '3'=Misto)
  g_6_8: string[]; // Redes institucionais ('1', '2', '3', '99')
  g_6_8_n1: string;
  g_6_8_n2: string;
  g_6_8_n3: string;
  g_6_8_n99a: string;
  g_6_8_n99b: string;
  g_6_9: string[]; // Planos contingência ('1' to '4', '99')
  g_6_9_outros: string;
  g_6_10: string[]; // Opções qualidade ('1' to '5', '99')
  g_6_10_outros: string;
  g_6_10_pops: string[]; // POPs disponiveis ('1' to '15')
  g_6_11: string; // Autonomia gerencial yesno
  gestao_complete: '0' | '1' | '2';

  // Global meta
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  return_code?: string;
}

export interface REDCapInstrument {
  id: string;
  name: string;
  statusField: keyof REDCapRecord;
  title: string;
}

export const REDCAP_INSTRUMENTS: REDCapInstrument[] = [
  { id: 'identificacao_institucional', name: 'Identificação Institucional', statusField: 'identificacao_institucional_complete', title: 'Identificação Institucional' },
  { id: 'estrutura_fisica', name: 'Estrutura Física', statusField: 'estrutura_fisica_complete', title: 'Estrutura Física' },
  { id: 'equipamentos', name: 'Equipamentos', statusField: 'equipamentos_complete', title: 'Equipamentos' },
  { id: 'capacidade_tecnica', name: 'Capacidade Técnica', statusField: 'capacidade_tecnica_complete', title: 'Capacidade Técnica' },
  { id: 'recursos_humanos', name: 'Recursos Humanos', statusField: 'recursos_humanos_complete', title: 'Recursos Humanos' },
  { id: 'gestao', name: 'Gestão', statusField: 'gestao_complete', title: 'Gestão da Qualidade e Organização' },
];

export const ESTADOS_LIST = [
  { id: '1', name: 'AC' }, { id: '2', name: 'AL' }, { id: '3', name: 'AP' }, { id: '4', name: 'AM' },
  { id: '5', name: 'BA' }, { id: '6', name: 'CE' }, { id: '7', name: 'DF' }, { id: '8', name: 'ES' },
  { id: '9', name: 'GO' }, { id: '10', name: 'MA' }, { id: '11', name: 'MT' }, { id: '12', name: 'MS' },
  { id: '13', name: 'MG' }, { id: '14', name: 'PA' }, { id: '15', name: 'PB' }, { id: '16', name: 'PR' },
  { id: '17', name: 'PE' }, { id: '18', name: 'PI' }, { id: '19', name: 'RJ' }, { id: '20', name: 'RN' },
  { id: '21', name: 'RS' }, { id: '22', name: 'RO' }, { id: '23', name: 'RR' }, { id: '24', name: 'SC' },
  { id: '25', name: 'SP' }, { id: '26', name: 'SE' }, { id: '27', name: 'TO' }
];

export function getEstadoNameById(id: string): string {
  return ESTADOS_LIST.find(e => e.id === id)?.name || id;
}
