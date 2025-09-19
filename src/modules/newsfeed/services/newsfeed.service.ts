import type { FastifyInstance } from "fastify";
import Parser from "rss-parser";
import type { NewsItem } from "../types/newsItem";
import { feedToDate } from "../utils/utils";

const parser: Parser = new Parser();

type GetNewsfeedOptions = {
	url: string;
	force: boolean;
};

export async function getNewsfeed(
	fastify: FastifyInstance,
	{ url, force }: GetNewsfeedOptions,
) {
	fastify.log.info({ url, force }, "Fetching newsfeed...");

	let feedData: NewsItem[] = [];

	if (!force) {
		// TODO: check DB first
		feedData = [];
	}

	if (!feedData.length || force) {
		feedData = await parseFeed(url);
		// TODO: save to DB
	}

	return feedData.map((item) => ({
		...item,
		pubDate: item.pubDate ? item.pubDate.toISOString() : null,
	}));
}

async function parseFeed(url: string): Promise<NewsItem[]> {
	try {
		const feed = await parser.parseURL(url);

		return feed.items.map((item) => ({
			title: item.title ?? "",
			rssUrl: url,
			link: item.link ?? "",
			pubDate: feedToDate(item.pubDate ?? item.isoDate ?? null),
			description: item.description ?? item.contentSnippet ?? "",
		}));
	} catch (err) {
		console.error("Failed to parse RSS feed:", err);
		return [];
	}
}
