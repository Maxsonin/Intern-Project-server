import type { FromSchema } from "json-schema-to-ts";

export const leskoAuctionBodySchema = {
	type: "object",
	properties: {
		data: {
			type: "array",
			items: {
				type: "object",
				properties: {
					bidId: { type: "string" },
					leskoid: { type: "string" },
					sizes: {
						type: "array",
						items: {
							type: "array",
							items: [{ type: "number" }, { type: "number" }],
							minItems: 2,
							maxItems: 2,
						},
					},
				},
				required: ["bidId", "leskoid", "sizes"],
			},
		},
	},
	required: ["data"],
} as const;

export const leskoAuctionResponseSchema = {
	200: {
		type: "object",
		properties: {
			bids: {
				type: "array",
				items: {
					anyOf: [
						{
							type: "object",
							properties: {
								requestId: { type: "string" },
								cpm: { type: "number" },
								currency: { type: "string" },
								width: { type: "number" },
								height: { type: "number" },
								creativeId: { type: "string" },
								ad: { type: "string" },
								ttl: { type: "number" },
								netRevenue: { type: "boolean", default: true },
								mediaType: {
									type: "string",
									enum: ["banner", "video"],
									default: "banner",
								},
							},
							required: [
								"requestId",
								"cpm",
								"width",
								"height",
								"creativeId",
								"ad",
								"ttl",
								"netRevenue",
								"mediaType",
							],
						},
						{ type: "null" },
					],
				},
			},
		},
	},
} as const;

export type LeskoAuctionRequest = FromSchema<typeof leskoAuctionBodySchema>;
export type LeskoAuctionResponse = FromSchema<
	(typeof leskoAuctionResponseSchema)[200]
>;

export const leskoAuctionSchema = {
	tags: ["auction"],
	body: leskoAuctionBodySchema,
	response: leskoAuctionResponseSchema,
} as const;
