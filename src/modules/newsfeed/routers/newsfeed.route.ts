import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getNewsfeedSchema } from "../schemas/getNewsfeed.schema";
import { parseFeed } from "../services/newsfeed.service";

export async function getFeedDataRoutes(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();

	route.get(
		"/newsfeed",
		{ schema: getNewsfeedSchema },
		async (
			request: FastifyRequest<{
				Querystring: { url?: string; force?: number };
			}>,
			reply: FastifyReply,
		) => {
			try {
				const url = request.query.url ?? fastify.config.DEFAULT_FEED_URL;
				const force = request.query.force === 1;

				fastify.log.info({ url, force }, "Fetching newsfeed");

				if (force) {
					const feedData = await parseFeed(url);
					return reply.send({ data: feedData });
				}

				const dbData = null; // TODO: check DB first
				if (dbData) {
					return reply.send({ data: dbData });
				}

				const feedData = await parseFeed(url); // TODO: save to DB
				reply.send({ data: feedData });
			} catch (err) {
				fastify.log.error({ err }, "Error in newsfeed GET/ route");
				reply.internalServerError();
			}
		},
	);
}
