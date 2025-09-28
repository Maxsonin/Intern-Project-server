// allRoutes.ts
import type { FastifyInstance } from "fastify";
import getLineItemRoutes from "../lineItem/router/lineItem.route";
import leskoAuctionRoutes from "../auction/router/auction.route";

export default async function AdServerRoutes(fastify: FastifyInstance) {
	await fastify.register(getLineItemRoutes);
	await fastify.register(leskoAuctionRoutes);
}
