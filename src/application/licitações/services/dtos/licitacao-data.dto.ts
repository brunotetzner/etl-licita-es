export interface LicitacaoData {
  id_orgao: number;
  cnpj_orgao: string;
  nome_orgao: string;
  esfera_id: number;
  poder_id: number;
  cpf_orgao: string;
  id_tempo_publicacao: number;
  data_completa: Date;
  ano: number;
  mes: number;
  dia: number;
  trimestre: number;
  id_situacao: number;
  nome_situacao: string;
  cancelado: boolean;
  id_modalidade: number;
  nome_modalidade: string;
  id_tipocontrato: number;
  nome_tipocontrato: string;
  valor_global: number;
  nome: string;
  url: string;
  id_licitacao: number;
}
