import type { FromSchema } from "json-schema-to-ts";

export const getNewsfeedSchema = {
	summary: "Get newsfeed",
	description: "Retrieve news feed data from a specified URL",
	tags: ["newsfeed"],
	querystring: {
		type: "object",
		properties: {
			url: { type: "string" },
			force: { type: "boolean" },
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
							pubDate: { type: "string" },
							content: { type: "string" },
						},
						required: ["title", "link", "rssUrl", "pubDate", "content"],
					},
				},
			},
			required: ["data"],
		},
	},
} as const;

export type GetNewsfeedSchema = FromSchema<typeof getNewsfeedSchema>;
