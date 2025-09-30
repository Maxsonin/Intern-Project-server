import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import { leskoAuctionSchema } from "../schemas/auction.schema";
import { getAd } from "../services/adServer.service";

export default async function leskoAuctionRoutes(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();

	route.post(
		"/leskoAuction",
		{ schema: leskoAuctionSchema },
		async (request, _) => {
			console.log(request.body);
			const bids = await Promise.all(
				request.body.data.map(async (bid) => getAd(fastify, bid)),
			);
			return { bids };
		},
	);
}
