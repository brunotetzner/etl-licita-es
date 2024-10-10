import axios from "axios";
import { LicitacaoData } from "../../services/dtos/licitacao-data.dto";

export async function getPncpLicitacoes(): Promise<LicitacaoData[]> {
  try {
    const response = await axios.get(
      "https://treina.pncp.gov.br/api/search/?q=&tipos_documento=pcaorgao&pagina=1&tam_pagina=1000&ordenacao=-data"
    );

    const dadosApi = response.data.items;

    let idIncremental = 0;
    const dadosLicitacao: LicitacaoData[] = dadosApi.map((item: any) => {
      idIncremental++;
      return {
        id_orgao: item.orgao_id || idIncremental,
        cnpj_orgao: item.orgao_cnpj,
        nome_orgao: item.orgao_nome || "NÃO INFORMADO",
        esfera_id: item.esfera_id || idIncremental,
        poder_id: item.poder_id || idIncremental,
        id_tempo_publicacao: idIncremental,
        data_completa: new Date(item.data_publicacao_pncp),
        ano: parseInt(item.ano, 10),
        mes: new Date(item.data_publicacao_pncp).getMonth() + 1,
        dia: new Date(item.data_publicacao_pncp).getDate(),
        trimestre: Math.floor(
          (new Date(item.data_publicacao_pncp).getMonth() + 3) / 3
        ),
        id_situacao: idIncremental,
        nome_situacao: item.situacao_nome,
        cancelado: String(!!item.cancelado),
        id_modalidade: item.modalidade_licitacao_id || idIncremental,
        nome_modalidade: item.modalidade_licitacao_nome,
        id_tipocontrato: item.tipo_contrato_id || idIncremental,
        nome_tipocontrato: item.tipo_contrato_nome || "NÃO INFORMADO",
        valor_global: item.valor_global,
        nome: item.title,
        url: `https://treina.pncp.gov.br${item.item_url}`,
        id_licitacao: item.id,
      };
    });
    return dadosLicitacao;
  } catch (error) {
    console.error("Erro ao gerar a planilha:", error);
    throw new Error("Erro ao gerar a planilha");
  }
}
