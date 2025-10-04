import type { FromSchema } from "json-schema-to-ts";

export const getNewsfeedSchema = {
	summary: "Get newsfeed",
	description: "Retrieve news feed data from a specified URL",
	tags: ["newsfeed"],
	querystring: {
		type: "object",
		properties: {
			url: {
				type: "string",
				format: "uri",
				default: "https://www.wired.com/feed/rss",
			},
			force: { type: "integer", enum: [0, 1], default: 0 },
		},
		required: [],
		additionalProperties: false,
	},
	response: {
		200: {
			type: "object",
			properties: {
				data: {
					type: "array",
					items: {
						type: "object",
						properties: {
							title: { type: "string" },
							link: { type: "string" },
							rssUrl: { type: "string" },
							pubDate: { type: "string", format: "date-time" },
							description: { type: "string" },
							thumbnail: { type: "string", format: "uri" },
						},
						required: ["rssUrl"],
					},
				},
			},
			required: ["data"],
		},
	},
} as const;

export type GetNewsfeedSchema = FromSchema<typeof getNewsfeedSchema>;
