import type { FastifyInstance } from "fastify";
import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { getAd } from "../services/adServer.service";
import {
	leskoAuctionBodySchema,
	leskoAuctionResponseSchema,
} from "../schemas/auction.schema";

export default async function leskoAuctionRoutes(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();

	route.post(
		"/leskoAuction",
		{
			schema: {
				tags: ["auction"],
				body: leskoAuctionBodySchema,
				response: leskoAuctionResponseSchema,
			},
		},
		async (request, _) => {
			console.log(request.body);
			const bids = await Promise.all(
				request.body.data.map(async (bid) => getAd(fastify, bid)),
			);
			return { bids };
		},
	);
}
