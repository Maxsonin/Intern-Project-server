import { readdirSync } from "node:fs";
import { join } from "node:path";
import AutoLoad from "@fastify/autoload";
import type Ajv from "ajv";
import Fastify, { type FastifyServerOptions } from "fastify";
import configPlugin from "./config";
import clickhousePlugin from "./config/clickhouse";
import prismaPlugin from "./config/prisma";

export type AppOptions = Partial<FastifyServerOptions>;

async function buildApp(options: AppOptions = {}) {
	const fastify = Fastify({
		...options,
		ajv: {
			plugins: [
				(ajv: Ajv) => {
					ajv.addKeyword({ keyword: "x-examples" });
				},
			],
		},
	});

	await fastify.register(configPlugin);
	await fastify.register(prismaPlugin);
	await fastify.register(clickhousePlugin);

	try {
		fastify.decorate("logPluginLoad", (pluginName: string) => {
			fastify.log.info(`✅ Plugin loaded: ${pluginName}`);
		});

		// --- Load global plugins ---
		fastify.log.info("🔌 Loading plugins...");
		await fastify.register(AutoLoad, {
			dir: join(__dirname, "plugins"),
			options,
			ignorePattern: /^((?!plugin).)*$/, // only load .plugin.ts
		});
		fastify.log.info("✅ Plugins loaded successfully");

		// --- Load module routes ---
		fastify.log.info("🔌 Loading routes...");

		const modulesDir = join(__dirname, "modules");
		const routeDirs = readdirSync(modulesDir, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => join(modulesDir, dirent.name, "routes"));

		await Promise.all(
			routeDirs.map((dir) =>
				fastify.register(AutoLoad, {
					dir,
					options,
					ignorePattern: /^((?!route).)*$/, // only load .route.ts
				}),
			),
		);
		fastify.log.info("✅ Routes loaded successfully");

		fastify.cron.startAllJobs();
	} catch (error) {
		fastify.log.error("❌ Error in autoload:", error);
		throw error;
	}

	return fastify;
}

export default buildApp;
