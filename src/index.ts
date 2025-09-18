import buildApp from "./app";

async function bootstrap() {
	const fastify = await buildApp();

	const port = fastify.config.PORT;
	const host = fastify.config.HOST;

	try {
		const address = await fastify.listen({ port, host });
		fastify.log.info(`🚀 Server running at ${address}`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

void bootstrap();
