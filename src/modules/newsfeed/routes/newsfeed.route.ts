import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import { getNewsfeedSchema } from "../schemas/getNewsfeed.schema";
import { getNewsfeed } from "../services/newsfeed.service";

export default async function getFeedDataRoutes(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();

	route.get(
		"/newsfeed",
		{ schema: getNewsfeedSchema },
		async (request, reply) => {
			try {
				const url = request.query.url ?? fastify.config.DEFAULT_FEED_URL;
				const force = request.query.force === 1;

				const feedData = await getNewsfeed(fastify, { url, force });

				reply.send({ data: feedData });
			} catch (err) {
				fastify.log.error({ err }, "Error in newsfeed GET/ route");
				reply.internalServerError();
			}
		},
	);
}
