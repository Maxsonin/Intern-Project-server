import type { FromSchema } from "json-schema-to-ts";

export const EnvSchema = {
	type: "object",
	properties: {
		PORT: { type: "number" },
		HOST: { type: "string" },

		DEFAULT_FEED_URL: { type: "string" },

		JWT_SECRET: { type: "string" },

		NODE_ENV: { type: "string" },

		NEWSFEED_REFRESH_CRON: { type: "string", default: "0 0 * * 1" }, // every Monday at 00:00

		CLICKHOUSE_DB: { type: "string", default: "statistics" },
		CLICKHOUSE_PASSWORD: { type: "string" },
		CLICKHOUSE_USER: { type: "string" },
		CLICKHOUSE_URL: { type: "string" },
	},
	required: [
		"PORT",
		"HOST",
		"DEFAULT_FEED_URL",
		"JWT_SECRET",
		"NODE_ENV",
		"NEWSFEED_REFRESH_CRON",
		"CLICKHOUSE_DB",
		"CLICKHOUSE_PASSWORD",
		"CLICKHOUSE_USER",
		"CLICKHOUSE_URL",
	],
	additionalProperties: false,
} as const;

export type Config = FromSchema<typeof EnvSchema>;
