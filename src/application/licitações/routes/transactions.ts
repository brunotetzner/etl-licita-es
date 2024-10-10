import { FastifyInstance } from "fastify";
import { getLicitacoesService } from "../services/get-licitações";

export async function transactionRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    try {
      const planilhaBuffer = await getLicitacoesService();

      reply
        .header(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        .header("Content-Disposition", "attachment; filename=licitacoes.xlsx");

      return reply.send(planilhaBuffer);
    } catch (error) {
      reply.status(500).send({ error: "Erro ao gerar a planilha" });
    }
  });
}
