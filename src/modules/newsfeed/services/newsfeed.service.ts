import type { News } from "@prisma/client";
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
			return formatFeedData(await parseFeed(fastify, url));
		}

		const dbNews = await fastify.prisma.news.findMany({
			where: { rssUrl: url },
			orderBy: { pubDate: "desc" },
		});
		if (dbNews.length) {
			return formatFeedData(mapPrismaNewsToNewsItem(dbNews));
		}

		const parsed = await parseFeed(fastify, url);
		await Promise.all(
			parsed.map((item) =>
				fastify.prisma.news.upsert({
					where: { link: item.link },
					update: { ...item },
					create: { ...item },
				}),
			),
		);

		return formatFeedData(parsed);
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

export async function refreshNewsfeed(fastify: FastifyInstance) {
	fastify.log.info("Refreshing all newsfeeds...");

	const rssUrls = (
		await fastify.prisma.news.findMany({
			select: { rssUrl: true },
			distinct: ["rssUrl"],
		})
	).map((el) => el.rssUrl);

	if (!rssUrls.length) {
		fastify.log.warn("No RSS URLs found in DB to refresh.");
		return [];
	}

	for (const rssUrl of rssUrls) {
		try {
			const parsed = await parseFeed(fastify, rssUrl);

			await Promise.all(
				parsed.map((item) =>
					fastify.prisma.news.upsert({
						where: { link: item.link },
						update: { ...item },
						create: { ...item },
					}),
				),
			);
		} catch (err) {
			fastify.log.error({ rssUrl, err }, "Failed to refresh feed");
		}
	}

	fastify.log.info("Successfully refreshed all newsfeeds");
}

async function parseFeed(
	fastify: FastifyInstance,
	url: string,
): Promise<NewsItem[]> {
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
		})) as NewsItem[];
	} catch (err) {
		fastify.log.error("Failed to parse RSS feed:", err);
		return [];
	}
}

function mapPrismaNewsToNewsItem(news: News[]): NewsItem[] {
	return news.map((item) => ({
		title: item.title ?? undefined,
		link: item.link,
		rssUrl: item.rssUrl,
		pubDate: item.pubDate ?? undefined,
		description: item.description ?? undefined,
		thumbnail: item.thumbnail ?? undefined,
	}));
}
