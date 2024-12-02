import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { getLicitacoesService } from "../services/get-licitações.service";

interface LicitacoesQuery {
  number: string;
}

export async function transactionRoutes(app: FastifyInstance) {
  app.get(
    "/",
    async (
      request: FastifyRequest<{ Querystring: LicitacoesQuery }>,
      reply: FastifyReply
    ) => {
      try {
        const { number } = request.query;

        if (!number) {
          return reply
            .status(400)
            .send({ error: "Parâmetro 'number' é obrigatório." });
        }

        const planilhaBuffer = await getLicitacoesService({ number });

        reply
          .header(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          )
          .header(
            "Content-Disposition",
            "attachment; filename=licitacoes.xlsx"
          );

        return reply.send(planilhaBuffer);
      } catch (error) {
        console.error("Erro ao obter licitações:", error);
        return reply
          .status(500)
          .send({ error: "Erro interno ao gerar a planilha." });
      }
    }
  );
}
