export function limitTextLength(
  dadosLicitacao: object[],
  maxLength = 3000
): object[] {
  return dadosLicitacao.map((licitacao) => {
    const updatedLicitacao = { ...licitacao } as { [key: string]: any };

    for (const key in updatedLicitacao) {
      if (
        typeof updatedLicitacao[key] === "string" &&
        updatedLicitacao[key].length > maxLength
      ) {
        updatedLicitacao[key] = updatedLicitacao[key].substring(0, maxLength);
      }
    }

    return updatedLicitacao;
  });
}
