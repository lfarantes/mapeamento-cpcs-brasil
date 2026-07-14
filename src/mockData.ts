import { REDCapRecord, AuditLog } from './types';

export const INITIAL_RECORDS: REDCapRecord[] = [
  {
    record_id: '1',
    ii_1_1: 'Centro de Pesquisa Clínica do Hospital das Clínicas da FMUSP',
    ii_1_2: 'CPC-HCFMUSP',
    ii_1_2_n: '1',
    ii_1_3_1: '05403-000',
    ii_1_3_2: 'Avenida Dr. Enéas Carvalho de Aguiar',
    ii_1_3_3: '255',
    ii_1_3_4: 'Prédio dos Ambulatórios, 4º Andar',
    ii_1_3_5: 'Cerqueira César',
    ii_1_3_6: 'São Paulo',
    ii_1_3_7: '25', // SP (25 correspond to SP)
    ii_1_4: '(11) 2661-0000',
    ii_1_4_1: '(11) 2661-1111',
    ii_1_5: 'diretoria.pesquisa@hc.fm.usp.br',
    ii_1_6: 'https://www.hc.fm.usp.br/pesquisa',
    ii_1_6_n: '1',
    ii_1_7: '60.448.040/0001-22',
    ii_1_8: '1', // Sim
    ii_1_8_1: '5', // Hospital de ensino vinculado ao SUS
    ii_1_8_1_1: '',
    ii_1_9_a: '1', // Sim
    ii_1_10: '1', // Sim
    ii_1_10_1: '2077926',
    ii_1_10_2: '',
    ii_1_11: '1', // Pública
    ii_1_12: '1944',
    ii_1_13: 'Fundação Faculdade de Medicina',
    ii_1_13_n: '1',
    identificacao_institucional_complete: '2', // Complete

    // Estrutura Fisica
    qual_area_construcao_cpc: '1200',
    ef_2_2: '1', // Sim
    ef_2_3: '1', // Sim
    ef_2_4: '1', // Sim
    ef_2_5: ['2', '3', '5', '8', '12', '13', '14', '15', '17', '18', '19', '20', '21'], // recepção, banheiros, consultórios, etc.
    ef_2_5_outros: '',
    ef_2_6: ['1', '3'], // gineco, oftalmo
    ef_2_6_1: '',
    ef_2_7: ['1', '2', '4', '5', '6', '7', '8'], // adm, banheiros, copa, etc.
    ef_2_7_1: '',
    ef_2_8: [],
    ef_2_8_outros: '',
    ef_2_9: [],
    ef_2_9_1: '',
    ef_2_10: ['1', '2', '5', '7', '10'], // lab, imagem, transporte amostras, TI, residuos
    ef_2_10_1: '',
    ef_2_11: ['2', '3', '4', '8', '9'], // teleconsulta, eConsent, dados clinicos, etc.
    ef_2_11_1: '',
    estrutura_fisica_complete: '2', // Complete

    // Equipamentos
    eq_3_1: ['1', '2', '3', '4', '5', '6', '8', '9', '11', '12', '14'], // balança, bomba, desfibrilador...
    eq_3_1_outros: '',
    eq_3_2: ['1', '2', '3', '5', '6', '7', '8'], // centrifuga, freezer, geladeiras...
    eq_3_2_outros: '',
    eq_3_3: ['1', '5', '6', '8'], // camera fria, freezer, CSB...
    eq_3_3_outros: '',
    eq_3_4: ['1', '2', '3', '4', '5', '6', '7', '8'], // climatização, cameras, gerador...
    eq_3_4_outros: '',
    equipamentos_complete: '2', // Complete

    // Capacidade Técnica
    ct_4_1: ['1', '2', '3', '5'], // patrocinado, investigador, capacitação, acadêmicos
    ct_4_1_outros: '',
    ct_4_2: ['1', '2', '3', '4', '5'], // fases I a IV, observacional
    ct_4_2_outros: '',
    ct_4_3: ['3', '4', '5', '6'], // med, vacinas, terapias avan, dispositivos
    ct_4_3_outros: '',
    ct_4_4: ['2', '5', '10', '11', '13', '16', '20', '22', '24'], // cardiologia, endócrino, oncologia, etc.
    ct_4_4_outros: '',
    ct_4_5: '45',
    ct_4_5_n: '1',
    ct_4_6: '180',
    ct_4_6_n: '1',
    ct_4_7: '32',
    ct_4_7_n: '1',
    ct_4_8: '120',
    ct_4_8_n: '1',
    capacidade_tecnica_complete: '2', // Complete

    // Recursos Humanos
    rh_5_1: ['1', '3'], // equipe exclusiva, equipe mantenedora
    rh_5_1_outros: '',
    rh_5_1_1: ['1', '2', '4', '5', '7', '8', '12', '13'], // coord, enfermagem, medicos, etc.
    rh_5_1_1_coord: '8',
    rh_5_1_1_enf: '4',
    rh_5_1_1_ti: '1',
    rh_5_1_1_med: '6',
    rh_5_1_1_amostras_bio: '2',
    rh_5_1_1_prod_invest: '2',
    rh_5_1_1_farm: '2',
    rh_5_1_1_gproj: '1',
    rh_5_1_1_gadm: '1',
    rh_5_1_1_mon: '0',
    rh_5_1_1_sec: '2',
    rh_5_1_1_qual: '1',
    rh_5_1_1_fin: '1',
    rh_5_1_1_jur: '0',
    rh_5_1_1_outros_1: '',
    rh_5_1_1_outros_2: '',
    rh_5_1_2: '1', // Integral
    rh_5_1_3: '2', // Por função
    rh_5_1_4: '',
    rh_5_2: ['3', '4', '5', '6', '7'], // grad, especialização, mestrado, doutorado, pósdoc
    rh_5_2_medio: '0',
    rh_5_2_tec: '2',
    rh_5_2_grad: '12',
    rh_5_2_especializa: '8',
    rh_5_2_mest: '4',
    rh_5_2_dout: '3',
    rh_5_2_posdoc: '1',
    rh_5_3_n: '1', // Sim
    rh_5_3: '8',
    recursos_humanos_complete: '2', // Complete

    // Gestão
    g_6_1: '1', // Sim
    g_6_1_1: 'https://cpc-hc.fm.usp.br/organograma.pdf',
    g_6_2: '35',
    g_6_2_n: '1',
    g_6_3: '5', // Procuradoria do hospital
    g_6_3_outros: '',
    g_6_4: ['1', '2', '3', '4', '5'], // fontes
    g_6_4_outros: '',
    g_6_5: '1', // Formalizado
    g_6_6: '1', // Sim
    g_6_7: '3', // Misto
    g_6_8: ['2'], // Redes de pesquisa
    g_6_8_n1: '',
    g_6_8_n2: 'Rede Nacional de Pesquisa Clínica (RNPC)',
    g_6_8_n3: '',
    g_6_8_n99a: '',
    g_6_8_n99b: '',
    g_6_9: ['1', '3', '4'], // planos contingência
    g_6_9_outros: '',
    g_6_10: ['1', '2', '3', '4', '5'], // qualidade
    g_6_10_outros: '',
    g_6_10_pops: ['1', '2', '3', '4', '5', '6', '7', '8', '11', '12', '14', '15'], // POPs
    g_6_11: '1', // Sim
    gestao_complete: '2', // Complete

    created_at: '2026-05-10T10:30:00-03:00',
    updated_at: '2026-07-01T14:22:15-03:00',
    created_by: 'alice.silva@cpc.org.br',
    updated_by: 'alice.silva@cpc.org.br',
  },
  {
    record_id: '2',
    ii_1_1: 'Centro de Pesquisa Clínica do Hospital Moinhos de Vento',
    ii_1_2: 'CPC-HMV',
    ii_1_2_n: '1',
    ii_1_3_1: '90035-001',
    ii_1_3_2: 'Rua Ramiro Barcelos',
    ii_1_3_3: '910',
    ii_1_3_4: 'Bloco C, Sala 202',
    ii_1_3_5: 'Moinhos de Vento',
    ii_1_3_6: 'Porto Alegre',
    ii_1_3_7: '21', // RS (21 correspond to RS)
    ii_1_4: '(51) 3314-3434',
    ii_1_4_1: '',
    ii_1_5: 'pesquisa.clinica@hmv.org.br',
    ii_1_6: 'https://www.hospitalmoinhos.org.br/pesquisa',
    ii_1_6_n: '1',
    ii_1_7: '92.685.833/0001-51',
    ii_1_8: '1',
    ii_1_8_1: '4', // Hospital filantrópico
    ii_1_8_1_1: '',
    ii_1_9_a: '1',
    ii_1_10: '0', // Não
    ii_1_10_1: '',
    ii_1_10_2: '2237253', // utiliza cnes do hospital
    ii_1_11: '3', // Filantrópica
    ii_1_12: '2005',
    ii_1_13: 'Associação Hospitalar Moinhos de Vento',
    ii_1_13_n: '1',
    identificacao_institucional_complete: '2',

    // Estrutura Fisica
    qual_area_construcao_cpc: '450',
    ef_2_2: '1',
    ef_2_3: '1',
    ef_2_4: '1',
    ef_2_5: ['2', '3', '5', '12', '13', '14', '15', '17', '19', '21'],
    ef_2_5_outros: '',
    ef_2_6: ['1'],
    ef_2_6_1: '',
    ef_2_7: ['1', '2', '4', '5', '6', '7'],
    ef_2_7_1: '',
    ef_2_8: [],
    ef_2_8_outros: '',
    ef_2_9: [],
    ef_2_9_1: '',
    ef_2_10: ['1', '2', '5', '7', '10'],
    ef_2_10_1: '',
    ef_2_11: ['2', '3', '4'],
    ef_2_11_1: '',
    estrutura_fisica_complete: '2',

    // Equipamentos
    eq_3_1: ['1', '3', '5', '6', '8', '9', '12', '14'],
    eq_3_1_outros: '',
    eq_3_2: ['2', '5', '6', '7', '8'],
    eq_3_2_outros: '',
    eq_3_3: ['5', '6'],
    eq_3_3_outros: '',
    eq_3_4: ['1', '2', '3', '7', '8'],
    eq_3_4_outros: '',
    equipamentos_complete: '2',

    // Capacidade Técnica
    ct_4_1: ['1', '2', '5'],
    ct_4_1_outros: '',
    ct_4_2: ['3', '4', '5'],
    ct_4_2_outros: '',
    ct_4_3: ['3', '4', '5'],
    ct_4_3_outros: '',
    ct_4_4: ['2', '20', '23', '25'], // Cardio, Onco, Pneumo, Reuma
    ct_4_4_outros: '',
    ct_4_5: '24',
    ct_4_5_n: '1',
    ct_4_6: '88',
    ct_4_6_n: '1',
    ct_4_7: '12',
    ct_4_7_n: '1',
    ct_4_8: '40',
    ct_4_8_n: '1',
    capacidade_tecnica_complete: '2',

    // Recursos Humanos
    rh_5_1: ['1'],
    rh_5_1_outros: '',
    rh_5_1_1: ['1', '2', '7', '8'],
    rh_5_1_1_coord: '3',
    rh_5_1_1_enf: '2',
    rh_5_1_1_ti: '0',
    rh_5_1_1_med: '0',
    rh_5_1_1_amostras_bio: '0',
    rh_5_1_1_prod_invest: '0',
    rh_5_1_1_farm: '1',
    rh_5_1_1_gproj: '1',
    rh_5_1_1_gadm: '0',
    rh_5_1_1_mon: '0',
    rh_5_1_1_sec: '1',
    rh_5_1_1_qual: '0',
    rh_5_1_1_fin: '0',
    rh_5_1_1_jur: '0',
    rh_5_1_1_outros_1: '',
    rh_5_1_1_outros_2: '',
    rh_5_1_2: '2', // Parcial
    rh_5_1_3: '5', // Multiplos estudos
    rh_5_1_4: '',
    rh_5_2: ['3', '4', '5'],
    rh_5_2_medio: '0',
    rh_5_2_tec: '1',
    rh_5_2_grad: '6',
    rh_5_2_especializa: '3',
    rh_5_2_mest: '1',
    rh_5_2_dout: '0',
    rh_5_2_posdoc: '0',
    rh_5_3_n: '1',
    rh_5_3: '3',
    recursos_humanos_complete: '2',

    // Gestão
    g_6_1: '1',
    g_6_1_1: 'https://hmv.org.br/pesquisa/organograma.pdf',
    g_6_2: '45',
    g_6_2_n: '1',
    g_6_3: '7', // Núcleo de pesquisa do hospital
    g_6_3_outros: '',
    g_6_4: ['1', '4'], // estudos industria, fundação
    g_6_4_outros: '',
    g_6_5: '2', // Em elaboração
    g_6_6: '1',
    g_6_7: '2', // Digital
    g_6_8: ['2'],
    g_6_8_n1: '',
    g_6_8_n2: 'Grupo de Pesquisa Cardiovascular do Sul',
    g_6_8_n3: '',
    g_6_8_n99a: '',
    g_6_8_n99b: '',
    g_6_9: ['1', '3'],
    g_6_9_outros: '',
    g_6_10: ['1', '2', '5'],
    g_6_10_outros: '',
    g_6_10_pops: ['1', '2', '3', '4', '5', '7', '11', '14'],
    g_6_11: '0', // Não
    gestao_complete: '2',

    created_at: '2026-06-01T09:15:00-03:00',
    updated_at: '2026-07-02T11:40:22-03:00',
    created_by: 'bruno.santos@cpc.org.br',
    updated_by: 'bruno.santos@cpc.org.br',
  },
  {
    record_id: '3',
    ii_1_1: 'Unidade de Pesquisa Clínica do Instituto Nacional de Câncer',
    ii_1_2: 'UPC-INCA',
    ii_1_2_n: '1',
    ii_1_3_1: '20231-050',
    ii_1_3_2: 'Praça Cruz Vermelha',
    ii_1_3_3: '23',
    ii_1_3_4: 'Anexo de Pesquisa',
    ii_1_3_5: 'Centro',
    ii_1_3_6: 'Rio de Janeiro',
    ii_1_3_7: '19', // RJ (19 correspond to RJ)
    ii_1_4: '(21) 3207-1000',
    ii_1_4_1: '',
    ii_1_5: 'pesquisaclinica@inca.gov.br',
    ii_1_6: 'https://www.inca.gov.br/pesquisa-clinica',
    ii_1_6_n: '1',
    ii_1_7: '00.394.544/0008-25',
    ii_1_8: '1',
    ii_1_8_1: '2', // Hospital público
    ii_1_8_1_1: '',
    ii_1_9_a: '0',
    ii_1_10: '1',
    ii_1_10_1: '2269783',
    ii_1_10_2: '',
    ii_1_11: '1', // Pública
    ii_1_12: '1998',
    ii_1_13: 'Ministério da Saúde',
    ii_1_13_n: '1',
    identificacao_institucional_complete: '2',

    // Estrutura Fisica
    qual_area_construcao_cpc: '800',
    ef_2_2: '1',
    ef_2_3: '1',
    ef_2_4: '1',
    ef_2_5: ['2', '3', '5', '8', '12', '13', '14', '15', '17', '18', '19', '21'],
    ef_2_5_outros: '',
    ef_2_6: [],
    ef_2_6_1: '',
    ef_2_7: ['1', '2', '4', '5', '6', '7'],
    ef_2_7_1: '',
    ef_2_8: [],
    ef_2_8_outros: '',
    ef_2_9: [],
    ef_2_9_1: '',
    ef_2_10: ['1', '2', '5', '7', '10'],
    ef_2_10_1: '',
    ef_2_11: ['2', '3', '8'],
    ef_2_11_1: '',
    estrutura_fisica_complete: '1', // Unverified

    // Equipamentos
    eq_3_1: ['1', '3', '5', '6', '8', '9', '11', '12', '14'],
    eq_3_1_outros: '',
    eq_3_2: ['1', '2', '3', '5', '6', '7', '8'],
    eq_3_2_outros: '',
    eq_3_3: ['1', '5', '6', '8'],
    eq_3_3_outros: '',
    eq_3_4: ['1', '2', '3', '6', '7', '8'],
    eq_3_4_outros: '',
    equipamentos_complete: '0', // Incomplete

    // Capacidade Técnica
    ct_4_1: ['1', '2', '5'],
    ct_4_1_outros: '',
    ct_4_2: ['2', '3', '4'],
    ct_4_2_outros: '',
    ct_4_3: ['4', '6'],
    ct_4_3_outros: '',
    ct_4_4: ['20', '22'], // Oncologia, Pediatria
    ct_4_4_outros: '',
    ct_4_5: '38',
    ct_4_5_n: '1',
    ct_4_6: '140',
    ct_4_6_n: '1',
    ct_4_7: '25',
    ct_4_7_n: '1',
    ct_4_8: '95',
    ct_4_8_n: '1',
    capacidade_tecnica_complete: '0',

    // Recursos Humanos
    rh_5_1: ['3'], // institucional
    rh_5_1_outros: '',
    rh_5_1_1: [],
    rh_5_1_1_coord: '',
    rh_5_1_1_enf: '',
    rh_5_1_1_ti: '',
    rh_5_1_1_med: '',
    rh_5_1_1_amostras_bio: '',
    rh_5_1_1_prod_invest: '',
    rh_5_1_1_farm: '',
    rh_5_1_1_gproj: '',
    rh_5_1_1_gadm: '',
    rh_5_1_1_mon: '',
    rh_5_1_1_sec: '',
    rh_5_1_1_qual: '',
    rh_5_1_1_fin: '',
    rh_5_1_1_jur: '',
    rh_5_1_1_outros_1: '',
    rh_5_1_1_outros_2: '',
    rh_5_1_2: '',
    rh_5_1_3: '',
    rh_5_1_4: '',
    rh_5_2: ['3', '5', '6'],
    rh_5_2_medio: '0',
    rh_5_2_tec: '4',
    rh_5_2_grad: '10',
    rh_5_2_especializa: '5',
    rh_5_2_mest: '3',
    rh_5_2_dout: '2',
    rh_5_2_posdoc: '0',
    rh_5_3_n: '1',
    rh_5_3: '5',
    recursos_humanos_complete: '0',

    // Gestão
    g_6_1: '1',
    g_6_1_1: 'https://www.inca.gov.br/pesquisa/organograma_upc.pdf',
    g_6_2: '60',
    g_6_2_n: '1',
    g_6_3: '4', // Procuradoria da universidade (representando procuradoria da união)
    g_6_3_outros: '',
    g_6_4: ['2', '3'], // agencias fomento, institucional
    g_6_4_outros: '',
    g_6_5: '3', // Sem planejamento formal
    g_6_6: '0',
    g_6_7: '1', // Físico
    g_6_8: ['2'],
    g_6_8_n1: '',
    g_6_8_n2: 'Rede Nacional de Desenvolvimento de Fármacos Oncológicos',
    g_6_8_n3: '',
    g_6_8_n99a: '',
    g_6_8_n99b: '',
    g_6_9: ['1', '3'],
    g_6_9_outros: '',
    g_6_10: ['1', '2', '5'],
    g_6_10_outros: '',
    g_6_10_pops: ['1', '3', '4', '5', '7', '11', '12', '14'],
    g_6_11: '0',
    gestao_complete: '0',

    created_at: '2026-06-15T08:00:00-03:00',
    updated_at: '2026-06-15T08:00:00-03:00',
    created_by: 'carlos.souza@cpc.org.br',
    updated_by: 'carlos.souza@cpc.org.br',
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-05-10T10:30:00-03:00',
    userId: 'user-admin',
    userName: 'Dra. Alice Silva',
    userRole: 'Administrador',
    action: 'Criação de Registro',
    recordId: '1',
    instrument: 'Identificação Institucional',
    details: 'Registro criado para o Centro de Pesquisa Clínica do Hospital das Clínicas da FMUSP.'
  },
  {
    id: 'log-2',
    timestamp: '2026-06-01T09:15:00-03:00',
    userId: 'user-coord',
    userName: 'Dr. Bruno Santos',
    userRole: 'Coordenador',
    action: 'Criação de Registro',
    recordId: '2',
    instrument: 'Identificação Institucional',
    details: 'Registro criado para o Centro de Pesquisa Clínica do Hospital Moinhos de Vento.'
  },
  {
    id: 'log-3',
    timestamp: '2026-06-15T08:00:00-03:00',
    userId: 'user-pesq',
    userName: 'Dr. Carlos Souza',
    userRole: 'Pesquisador',
    action: 'Criação de Registro',
    recordId: '3',
    instrument: 'Identificação Institucional',
    details: 'Registro criado para a Unidade de Pesquisa Clínica do Instituto Nacional de Câncer.'
  },
  {
    id: 'log-4',
    timestamp: '2026-07-01T14:22:15-03:00',
    userId: 'user-admin',
    userName: 'Dra. Alice Silva',
    userRole: 'Administrador',
    action: 'Atualização de Instrumento',
    recordId: '1',
    instrument: 'Gestão',
    details: 'Instrumento Gestão marcado como "Completo" (Status 2). Adicionados 12 POPs e o link do organograma.'
  },
  {
    id: 'log-5',
    timestamp: '2026-07-02T11:40:22-03:00',
    userId: 'user-coord',
    userName: 'Dr. Bruno Santos',
    userRole: 'Coordenador',
    action: 'Atualização de Instrumento',
    recordId: '2',
    instrument: 'Estrutura Física',
    details: 'Campos de estrutura atualizados. Área construída de 450 m² preenchida e confirmada.'
  }
];

export const EMPTY_RECORD = (newId: string, authorEmail: string): REDCapRecord => ({
  record_id: newId,
  ii_1_1: '',
  ii_1_2: '',
  ii_1_2_n: '1', // Standard se aplica
  ii_1_3_1: '',
  ii_1_3_2: '',
  ii_1_3_3: '',
  ii_1_3_4: '',
  ii_1_3_5: '',
  ii_1_3_6: '',
  ii_1_3_7: '',
  ii_1_4: '',
  ii_1_4_1: '',
  ii_1_5: '',
  ii_1_6: '',
  ii_1_6_n: '1',
  ii_1_7: '',
  ii_1_8: '',
  ii_1_8_1: '',
  ii_1_8_1_1: '',
  ii_1_9_a: '',
  ii_1_10: '',
  ii_1_10_1: '',
  ii_1_10_2: '',
  ii_1_11: '',
  ii_1_12: '',
  ii_1_13: '',
  ii_1_13_n: '1',
  identificacao_institucional_complete: '0',

  qual_area_construcao_cpc: '',
  ef_2_2: '',
  ef_2_3: '',
  ef_2_4: '',
  ef_2_5: [],
  ef_2_5_outros: '',
  ef_2_6: [],
  ef_2_6_1: '',
  ef_2_7: [],
  ef_2_7_1: '',
  ef_2_8: [],
  ef_2_8_outros: '',
  ef_2_9: [],
  ef_2_9_1: '',
  ef_2_10: [],
  ef_2_10_1: '',
  ef_2_11: [],
  ef_2_11_1: '',
  estrutura_fisica_complete: '0',

  eq_3_1: [],
  eq_3_1_outros: '',
  eq_3_2: [],
  eq_3_2_outros: '',
  eq_3_3: [],
  eq_3_3_outros: '',
  eq_3_4: [],
  eq_3_4_outros: '',
  equipamentos_complete: '0',

  ct_4_1: [],
  ct_4_1_outros: '',
  ct_4_2: [],
  ct_4_2_outros: '',
  ct_4_3: [],
  ct_4_3_outros: '',
  ct_4_4: [],
  ct_4_4_outros: '',
  ct_4_5: '',
  ct_4_5_n: '1',
  ct_4_6: '',
  ct_4_6_n: '1',
  ct_4_7: '',
  ct_4_7_n: '1',
  ct_4_8: '',
  ct_4_8_n: '1',
  capacidade_tecnica_complete: '0',

  rh_5_1: [],
  rh_5_1_outros: '',
  rh_5_1_1: [],
  rh_5_1_1_coord: '',
  rh_5_1_1_enf: '',
  rh_5_1_1_ti: '',
  rh_5_1_1_med: '',
  rh_5_1_1_amostras_bio: '',
  rh_5_1_1_prod_invest: '',
  rh_5_1_1_farm: '',
  rh_5_1_1_gproj: '',
  rh_5_1_1_gadm: '',
  rh_5_1_1_mon: '',
  rh_5_1_1_sec: '',
  rh_5_1_1_qual: '',
  rh_5_1_1_fin: '',
  rh_5_1_1_jur: '',
  rh_5_1_1_outros_1: '',
  rh_5_1_1_outros_2: '',
  rh_5_1_2: '',
  rh_5_1_3: '',
  rh_5_1_4: '',
  rh_5_2: [],
  rh_5_2_medio: '',
  rh_5_2_tec: '',
  rh_5_2_grad: '',
  rh_5_2_especializa: '',
  rh_5_2_mest: '',
  rh_5_2_dout: '',
  rh_5_2_posdoc: '',
  rh_5_3_n: '',
  rh_5_3: '',
  recursos_humanos_complete: '0',

  g_6_1: '',
  g_6_1_1: '',
  g_6_2: '',
  g_6_2_n: '1',
  g_6_3: '',
  g_6_3_outros: '',
  g_6_4: [],
  g_6_4_outros: '',
  g_6_5: '',
  g_6_6: '',
  g_6_7: '',
  g_6_8: [],
  g_6_8_n1: '',
  g_6_8_n2: '',
  g_6_8_n3: '',
  g_6_8_n99a: '',
  g_6_8_n99b: '',
  g_6_9: [],
  g_6_9_outros: '',
  g_6_10: [],
  g_6_10_outros: '',
  g_6_10_pops: [],
  g_6_11: '',
  gestao_complete: '0',

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  created_by: authorEmail,
  updated_by: authorEmail,
});
