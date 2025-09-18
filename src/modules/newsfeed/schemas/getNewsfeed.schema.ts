export const getNewsfeedSchema = {
	summary: "Get newsfeed",
	description: "Retrieve feed data from the server",
	tags: ["newsfeed"],
	querystring: {
		type: "object",
		properties: {
			url: { type: "string" },
			force: { type: "boolean" },
		},
		additionalProperties: false,
	},
	response: {
		200: {},
	},
} as const;
