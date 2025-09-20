import { join } from "node:path";
import AutoLoad from "@fastify/autoload";
import Fastify, { type FastifyServerOptions } from "fastify";
import configPlugin from "./config";
import prismaPlugin from "./config/prisma";
import { getFeedDataRoutes } from "./modules/newsfeed/routers/newsfeed.route";

export type AppOptions = Partial<FastifyServerOptions>;

async function buildApp(options: AppOptions = {}) {
	const fastify = Fastify(options);

	await fastify.register(configPlugin);
	await fastify.register(prismaPlugin);

	try {
		fastify.decorate("logPluginLoad", (pluginName: string) => {
			fastify.log.info(`✅ Plugin loaded: ${pluginName}`);
		});

		fastify.log.info("🔌 Loading plugins...");
		await fastify.register(AutoLoad, {
			dir: join(__dirname, "plugins"),
			options,
			ignorePattern: /^((?!plugin).)*$/, // only load .plugin.ts
		});
		fastify.log.info("✅ Plugins loaded successfully");
	} catch (error) {
		fastify.log.error("❌ Error in autoload:", error);
		throw error;
	}

	fastify.get("/health", async () => ({ status: "ok" }));

	fastify.register(getFeedDataRoutes);

	return fastify;
}

export default buildApp;
