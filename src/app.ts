import fastify from "fastify";
import { transactionRoutes } from "./application/licitações/routes/transactions";
import cookie from "@fastify/cookie";

export const app = fastify();

app.register(cookie);

app.register(transactionRoutes, {
  prefix: "/licitações",
});
