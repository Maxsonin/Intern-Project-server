import type { FromSchema } from "json-schema-to-ts";

export const parseUrlSchema = {
	summary: "Parse a webpage",
	description: "Extract page content from a URL",
	tags: ["newsfeed"],
	querystring: {
		type: "object",
		properties: {
			url: { type: "string", format: "uri" },
		},
		required: ["url"],
		additionalProperties: false,
	},
	response: {
		200: {
			type: "object",
			properties: {
				content: { type: ["string", "null"] },
			},
			required: ["content"],
		},
	},
} as const;

export type ParseUrlSchema = FromSchema<typeof parseUrlSchema>;
