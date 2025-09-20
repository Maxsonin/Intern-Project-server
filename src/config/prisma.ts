import { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

const prisma = new PrismaClient();

export default fp(
	async (fastify: FastifyInstance) => {
		fastify.decorate("prisma", prisma);

		try {
			await prisma.$connect();
			fastify.log.info("✅ Prisma connected");
		} catch (err) {
			fastify.log.error("❌ Prisma failed to connect:", err);
			throw err;
		}

		fastify.addHook("onClose", async () => {
			try {
				await prisma.$disconnect();
				fastify.log.info("✅ Prisma disconnected");
			} catch (err) {
				fastify.log.error("❌ Error disconnecting Prisma:", err);
			}
		});
	},
	{
		name: "prisma-plugin",
	},
);
