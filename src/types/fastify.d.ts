import type { Config } from "../config/schema";

declare module "fastify" {
	interface FastifyInstance {
		config: Config;
		prisma: PrismaClient;
		logPluginLoad: (pluginName: string) => void;
	}
}
