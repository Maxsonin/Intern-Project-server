import { createClient } from "@clickhouse/client";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export const TABLE_NAME = "events" as const;

export default fp(
	async (fastify: FastifyInstance) => {
		const DB_NAME = fastify.config.CLICKHOUSE_DB;

		const ch = createClient({
			url: fastify.config.CLICKHOUSE_URL,
			username: fastify.config.CLICKHOUSE_USER,
			password: fastify.config.CLICKHOUSE_PASSWORD,
			database: DB_NAME,
		});

		try {
			await ch.query({
				query: `CREATE DATABASE IF NOT EXISTS ${DB_NAME}`,
			});

			await ch.exec({
				query: `
				CREATE TABLE IF NOT EXISTS ${DB_NAME}.${TABLE_NAME} (
					id UUID DEFAULT generateUUIDv4(),
					eventType String,
					timestamp DateTime DEFAULT now(),
					countryCode String,
					deviceType String,
					adapter Nullable(String),
					creativeId Nullable(String),
					cpm Nullable(Float64)
				) ENGINE = MergeTree()
				ORDER BY (timestamp, eventType, id)`,
			});

			fastify.log.info("ClickHouse connected and database/table initialized.");
		} catch (error) {
			fastify.log.error("failed to initialize ClickHouse: ", error);
			throw error;
		}

		fastify.decorate("clickhouse", ch);

		fastify.addHook("onClose", async () => {
			await ch.close();
			fastify.log.info("ClickHouse connection closed.");
		});
	},
	{
		name: "clickhouse-plugin",
	},
);
