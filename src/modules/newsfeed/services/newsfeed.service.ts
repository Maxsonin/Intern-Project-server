import Parser from "rss-parser";
import type { NewsItem } from "../types/newsItem";
import { feedToDate } from "../utils/utils";

const parser: Parser = new Parser();

export async function parseFeed(url: string): Promise<NewsItem[]> {
	try {
		const feed = await parser.parseURL(url);

		return feed.items.map((item) => ({
			title: item.title ?? "",
			rssUrl: url,
			link: item.link ?? "",
			pubDate: feedToDate(item.pubDate ?? item.isoDate ?? null),
			content: item.contentSnippet ?? item.content ?? item.description ?? "",
		}));
	} catch (err) {
		console.error("Failed to parse RSS feed:", err);
		return [];
	}
}
