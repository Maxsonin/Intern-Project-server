import type { FastifyReply, FastifyRequest } from "fastify";
import { parseFeed } from "../services/newsfeed.service";
import type { NewsItem } from "../types/newsItem";

export async function getNewsfeedHandler(
	request: FastifyRequest<{ Querystring: { url?: string; force?: boolean } }>,
	reply: FastifyReply,
) {
	try {
		const url = request.query.url ?? request.server.config.DEFAULT_FEED_URL;
		const force = request.query.force ?? false;

		let feedData: NewsItem[] = [];
		if (force) {
			feedData = await parseFeed(url);
		} else {
			// TODO: check DB first
			const dbData = null;
			if (dbData) {
				feedData = dbData;
			} else {
				feedData = await parseFeed(url);
				// TODO: save to DB
			}
		}
		reply.code(200).send({ data: feedData });
	} catch {
		reply.code(500).send({ message: "Internal server error" });
	}
}
