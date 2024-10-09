import { FastifyInstance } from "fastify";
import { getLicitacoesService } from "../services/get-licitações";

export async function transactionRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    return getLicitacoesService();
  });
}
