import * as cheerio from "cheerio";
import type { FastifyInstance } from "fastify";
import Parser from "rss-parser";
import type { NewsItem } from "../types/newsItem";
import { feedToDate } from "../utils/utils";

const parser = new Parser({
	customFields: {
		item: [
			["description"],
			["thumbnail"],
			["media:content", "media_content", { keepArray: true }],
			["media:thumbnail", "media_thumbnail", { keepArray: true }],
		],
	},
});

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
			pubDate: item.pubDate?.toISOString(),
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

export async function parseUrl(
	fastify: FastifyInstance,
	url: string,
): Promise<string | null> {
	fastify.log.info({ url }, "Parsing HTML from URL");

	try {
		const $ = await cheerio.fromURL(url);

		$("header, footer, nav").remove(); // Remove noise

		const paragraphs = $("article p, .article__body p")
			.map((_, el) => $(el).text().trim())
			.get();

		const content = paragraphs.join("\n");
		return content;
	} catch (err) {
		fastify.log.error({ url, err }, "Error parsing URL");
		return null;
	}
}

async function parseFeed(url: string): Promise<NewsItem[]> {
	try {
		const feed = await parser.parseURL(url);

		return feed.items.map((item) => ({
			title: item.title,
			rssUrl: url,
			link: item.link,
			pubDate: feedToDate(item.pubDate ?? item.isoDate),
			description: item.description ?? item.contentSnippet ?? item.content,
			thumbnail:
				item.thumbnail ??
				item.media_thumbnail?.[0]?.$.url ??
				item.media_content?.[0]?.$.url,
		}));
	} catch (err) {
		console.error("Failed to parse RSS feed:", err);
		return [];
	}
}
