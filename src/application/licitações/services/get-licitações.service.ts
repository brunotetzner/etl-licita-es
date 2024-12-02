import axios from "axios";
import { generateExcelFile } from "../../../common/utils/generate-excel-file";
import { getPncpLicitacoes } from "../integrations/pncp/get-licitacoes.service";

export async function getLicitacoesService(data: {
  number: string;
}): Promise<Buffer> {
  const licitacoesPncp = await getPncpLicitacoes(data);
  return generateExcelFile(licitacoesPncp);
}
