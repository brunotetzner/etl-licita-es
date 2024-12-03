import axios from "axios";
import { google } from "googleapis";
import { LicitacaoDataDto } from "../../dtos/licitacao-data.dto";
import { limitNumberOfCaracters } from "../../../../common/utils/limit-number-of-caracters";
import { limitTextLength } from "../../../../common/utils/limit-object-number-of-caracteres";
import * as dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

// Função de delay para controlar a taxa de requisição
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendToGoogleSheets(data: LicitacaoDataDto[]): Promise<void> {
  const { GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY } =
    process.env;

  if (
    !GOOGLE_SHEET_ID ||
    !GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    !GOOGLE_PRIVATE_KEY
  ) {
    throw new Error(
      "Missing Google Sheets credentials in environment variables."
    );
  }

  // Autenticando com a API do Google Sheets
  const auth = new google.auth.JWT(
    GOOGLE_SERVICE_ACCOUNT_EMAIL,
    undefined,
    GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  );

  const sheets = google.sheets({ version: "v4", auth });

  try {
    const values = data.map((item) => [
      item.id_licitacao,
      item.titulo,
      item.descricao,
      item.url,
      item.data_criacao.toISOString(),
      item.numero_controle_pncp,
      item.orgao_id,
      item.orgao_cnpj,
      item.orgao_nome,
      item.unidade_id,
      item.unidade_nome,
      item.esfera_id,
      item.esfera_nome,
      item.poder_id,
      item.poder_nome,
      item.municipio_id,
      item.municipio_nome,
      item.uf,
      item.modalidade_licitacao_id,
      item.modalidade_licitacao_nome,
      item.situacao_id,
      item.situacao_nome,
      item.id_tempo,
      item.data_publicacao.toISOString(),
      item.ano,
      item.mes,
      item.cancelado,
      item.trimestre,
      item.valor_global,
      item.id_tipocontrato,
      item.tipocontrato,
      item.licitacao_items,
    ]);

    const resource = {
      values,
    };

    // Sobrescrevendo os dados na planilha (ao invés de apenas adicionar)
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Pagina1!A1", // Começando do A1 para substituir tudo
      valueInputOption: "RAW",
      resource,
    });

    console.log(`Dados sobrescritos na planilha: ${response.status}`);
  } catch (error) {
    console.error("Erro ao enviar dados para o Google Sheets:", error);
    throw error;
  }
}

// Função para pegar os dados de licitação
export async function getPncpLicitacoes(data: {
  number: string;
}): Promise<LicitacaoDataDto[]> {
  const { number } = data;
  const numberPerPage = Number(number) || 1400;

  try {
    const response = await axios.get(
      `https://treina.pncp.gov.br/api/search/?tipos_documento=edital&ordenacao=-data&pagina=1&tam_pagina=${numberPerPage}&status=recebendo_proposta`
    );

    let dadosApi = response.data.items;
    let idIncremental = 0;
    const dadosLicitacao: LicitacaoDataDto[] = [];

    while (dadosApi.length > 0) {
      // Processar 100 itens por vez
      const lote = dadosApi.slice(0, 100);
      dadosApi = dadosApi.slice(100); // Remove os itens processados

      const promises = lote.map(async (item) => {
        idIncremental++;
        const cnpjOrgao = String(item.orgao_cnpj);
        const urlParams = item.item_url.split(cnpjOrgao);
        const paramsLicitacaoData = urlParams[urlParams.length - 1];
        const splitparamsLicitacaoData = paramsLicitacaoData.split("/");

        const paramsLicitacaoItems =
          splitparamsLicitacaoData[1] + "/" + splitparamsLicitacaoData[2];

        try {
          const [licitacaoResponse, licitacaoItemsResponse] = await Promise.all(
            [
              axios.get(
                `https://treina.pncp.gov.br/api/pncp/v1/orgaos/${cnpjOrgao}/compras${paramsLicitacaoData}`
              ),
              axios.get(
                `https://treina.pncp.gov.br/api/pncp/v1/orgaos/${cnpjOrgao}/compras/${paramsLicitacaoItems}/itens?pagina=1&tamanhoPagina=50000`
              ),
            ]
          );

          const licitacaoData = licitacaoResponse.data;
          const licitacoesItems = licitacaoItemsResponse.data;

          let licitacaoItemsStringList = "Itens da licitação:\n";
          licitacoesItems.forEach((item: any) => {
            licitacaoItemsStringList += `numero do item: ${
              item.numeroItem
            }\ndescricao: ${limitNumberOfCaracters(
              item.descricao
            )}\nquantidade: ${item.quantidade}\nvalor unitário: ${
              item.valorUnitarioEstimado
            }\nvalor total: ${item.valorTotal}\n\n`;
          });

          const urlToPncpDetailsPage = `https://treina.pncp.gov.br/app/editais/${cnpjOrgao}${paramsLicitacaoData}`;
          return {
            id_licitacao: item.id,
            titulo: item.title || "NÃO INFORMADO",
            descricao: item.description || "NÃO INFORMADO",
            url: urlToPncpDetailsPage,
            data_criacao: new Date(item.createdAt),
            numero_controle_pncp: item.numero_controle_pncp || "NÃO INFORMADO",
            orgao_id: item.orgao_id || idIncremental,
            orgao_cnpj: item.orgao_cnpj || "NÃO INFORMADO",
            orgao_nome: item.orgao_nome || "NÃO INFORMADO",
            unidade_id: item.unidade_id || idIncremental,
            unidade_nome: item.unidade_nome || "NÃO INFORMADO",
            esfera_id: item.esfera_id || "NÃO INFORMADO",
            esfera_nome: item.esfera_nome || "NÃO INFORMADO",
            poder_id: item.poder_id || "NÃO INFORMADO",
            poder_nome: item.poder_nome || "NÃO INFORMADO",
            municipio_id: item.municipio_id || idIncremental,
            municipio_nome: item.municipio_nome || "NÃO INFORMADO",
            uf: item.uf || "NÃO INFORMADO",
            modalidade_licitacao_id:
              item.modalidade_licitacao_id || idIncremental,
            modalidade_licitacao_nome:
              item.modalidade_licitacao_nome || "NÃO INFORMADO",
            situacao_id: item.situacao_id || idIncremental,
            situacao_nome: item.situacao_nome || "NÃO INFORMADO",
            id_tempo: idIncremental,
            data_publicacao: new Date(item.data_publicacao_pncp),
            ano: parseInt(item.ano, 10),
            mes: new Date(item.data_publicacao_pncp).getMonth() + 1,
            cancelado: String(!!item.cancelado),
            trimestre: Math.floor(
              (new Date(item.data_publicacao_pncp).getMonth() + 3) / 3
            ),
            valor_global: licitacaoData.valorTotalEstimado || 0,
            id_tipocontrato:
              item.document_type === "edital" ? 1 : "NÃO INFORMADO",
            tipocontrato: item.document_type || "NÃO INFORMADO",
            licitacao_items: licitacaoItemsStringList,
          };
        } catch (error) {
          console.error("Erro ao buscar detalhes da licitação:", error);
          throw error;
        }
      });

      // Aguardar a resolução de todas as promessas de licitação antes de continuar
      const loteLicitacoes = await Promise.all(promises);
      dadosLicitacao.push(...loteLicitacoes);

      await delay(5000);
    }

    // Enviar os dados para o Google Sheets
    await sendToGoogleSheets(dadosLicitacao);

    return dadosLicitacao;
  } catch (error) {
    console.error("Erro ao buscar dados da licitação:", error);
    throw error;
  }
}
