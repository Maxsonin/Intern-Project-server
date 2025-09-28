// import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
// import type { FastifyInstance } from "fastify";
// import { getAd } from "../services/adServer.service";

// export default async function getFeedDataRoutes(fastify: FastifyInstance) {
// 	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();

// 	route.post("/leskoAuction", { schema: {} }, async (request) => {
// 		return getAd(request.body);
// 	});
// }
