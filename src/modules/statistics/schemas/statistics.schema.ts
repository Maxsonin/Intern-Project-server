import type { FromSchema } from "json-schema-to-ts";

export const EventSchema = {
	tags: ["statistics"],
	body: {
		type: "array",
		description: "Save incoming event data",
		items: {
			type: "object",
			properties: {
				eventType: {
					type: "string",
					enum: [
						"LoadPage",
						"LoadAdModule",
						"auctionInit",
						"auctionEnd",
						"bidRequested",
						"bidResponse",
						"bidWon",
					],
				},
				deviceType: { type: "string", enum: ["mobile", "desktop"] },
				adapter: { type: "string" },
				creativeId: { type: "string" },
				cpm: { type: "number" },
			},
			required: ["eventType", "deviceType"],
			additionalProperties: false,
		},
	} as const,
	security: [{ sessionCookie: [] }],
} as const;

export const FilterSchema = {
	tags: ["statistics"],
	body: {
		type: "object",
		properties: {
			columns: {
				type: "array",
				items: {
					type: "string",
					enum: [
						"eventType",
						"timestamp",
						"countryCode",
						"deviceType",
						"adapter",
						"creativeId",
						"cpm",
					],
				},
			},
			filters: {
				type: "object",
				properties: {
					eventType: {
						type: "array",
						items: {
							type: "string",
							enum: [
								"LoadPage",
								"LoadAdModule",
								"auctionInit",
								"auctionEnd",
								"bidRequested",
								"bidResponse",
								"bidWon",
							],
						},
					},
					deviceType: {
						type: "array",
						items: {
							type: "string",
							enum: ["mobile", "desktop"],
						},
					},
					adapter: {
						type: "array",
						items: { type: "string" },
					},
					creativeId: {
						type: "string",
					},
					countryCode: {
						type: "string",
					},
					cpm: {
						type: "object",
						properties: {
							eq: { type: "number", minimum: 0 },
							gte: { type: "number", minimum: 0 },
							lte: { type: "number", minimum: 0 },
						},
						additionalProperties: false,
					},
					timestamp: {
						type: "object",
						properties: {
							from: { type: "string", format: "date-time" },
							to: { type: "string", format: "date-time" },
						},
						additionalProperties: false,
					},
				},
				additionalProperties: false,
			},
			pagination: {
				type: "object",
				properties: {
					limit: { type: "integer", minimum: 1, maximum: 100, default: 50 },
					page: { type: "integer", minimum: 1, default: 1 },
				},
				additionalProperties: false,
			},
			sort: {
				type: "object",
				properties: {
					field: {
						type: "string",
						enum: [
							"eventType",
							"timestamp",
							"countryCode",
							"deviceType",
							"adapter",
							"creativeId",
							"cpm",
						],
						default: "timestamp",
					},
					order: { type: "string", enum: ["asc", "desc"], default: "desc" },
				},
				additionalProperties: false,
			},
		},
		required: ["columns"],
		additionalProperties: false,
	} as const,
	security: [{ sessionCookie: [] }],
} as const;

export type EventBody = FromSchema<typeof EventSchema.body>;
export type EventBodyItem = FromSchema<typeof EventSchema.body.items>;

export type FilterBody = FromSchema<typeof FilterSchema.body>;
export type FilterBodyFilters = FromSchema<
	typeof FilterSchema.body.properties.filters
>;
export type FilterBodySort = FromSchema<
	typeof FilterSchema.body.properties.sort
>;
