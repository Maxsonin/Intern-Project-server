import type { FastifyReply, FastifyRequest } from "fastify";
import { parseFeed } from "../services/newsfeed.service";

export async function getNewsfeedHandler(
	request: FastifyRequest<{ Querystring: { url?: string; force?: number } }>,
	reply: FastifyReply,
) {
	try {
		const url = request.query.url ?? request.server.config.DEFAULT_FEED_URL;
		const force = request.query.force === 1;

		request.log.info({ url, force }, "Fetching newsfeed");

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
		request.log.error({ err }, "Error in newsfeed handler");
		reply.internalServerError();
	}
}
