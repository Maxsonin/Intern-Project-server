import type { FastifyInstance } from "fastify";
import leskoAuctionRoutes from "../auction/router/auction.route";
import getLineItemRoutes from "../lineItem/router/lineItem.route";

export default async function AdServerRoutes(fastify: FastifyInstance) {
	await fastify.register(getLineItemRoutes);
	await fastify.register(leskoAuctionRoutes);
}
