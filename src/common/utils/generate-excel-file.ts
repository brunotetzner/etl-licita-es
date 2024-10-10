import * as XLSX from "xlsx";

export function generateExcelFile(data: object[]): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Licitacoes");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return buffer;
}
