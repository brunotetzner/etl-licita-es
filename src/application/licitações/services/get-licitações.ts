import axios from "axios";
import { generateExcelFile } from "../../../common/utils/generate-excel-file";
import { getPncpLicitacoes } from "../integrations/pncp/get-licitações";

export async function getLicitacoesService(): Promise<Buffer> {
  const licitacoesPncp = await getPncpLicitacoes();
  return generateExcelFile(licitacoesPncp);
}
