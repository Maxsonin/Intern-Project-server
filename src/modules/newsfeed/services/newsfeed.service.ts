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

	const formatFeedData = (feedData: NewsItem[]) =>
		feedData.map((item) => ({
			...item,
			pubDate: item.pubDate ? item.pubDate.toISOString() : null,
		}));

	try {
		if (force) {
			const feedData = await parseFeed(url);
			return formatFeedData(feedData);
		}

		let feedData = await fastify.prisma.news.findMany({
			where: { rssUrl: url },
			orderBy: { pubDate: "desc" },
		});

		if (!feedData.length) {
			feedData = await parseFeed(url);

			await Promise.all(
				feedData.map((item: NewsItem) =>
					fastify.prisma.news.upsert({
						where: { link: item.link },
						update: { ...item },
						create: { ...item },
					}),
				),
			);
		}

		return formatFeedData(feedData);
	} catch (error) {
		fastify.log.error({ url, error }, `Failed to fetch newsfeed: ${error}`);
		return [];
	}
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
