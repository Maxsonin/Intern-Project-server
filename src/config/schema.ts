import type { FromSchema } from "json-schema-to-ts";

export const EnvSchema = {
	type: "object",
	properties: {
		PORT: { type: "number" },
		HOST: { type: "string" },
		DEFAULT_FEED_URL: { type: "string" },
		JWT_SECRET: { type: "string" },
		NODE_ENV: { type: "string" },
	},
	required: ["PORT", "HOST", "DEFAULT_FEED_URL", "JWT_SECRET", "NODE_ENV"],
	additionalProperties: false,
} as const;

export type Config = FromSchema<typeof EnvSchema>;
