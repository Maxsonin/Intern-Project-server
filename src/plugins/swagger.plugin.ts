import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fp from "fastify-plugin";

const pluginName = "swagger-plugin";

export default fp(
	async (fastify) => {
		// Register the Swagger spec generator
		await fastify.register(fastifySwagger, {
			openapi: {
				info: {
					title: "Intern-Project-server",
					description: "API documentation for Intern-Project-server",
					version: "0.0.1",
				},
			},
		});

		// Register Swagger UI
		await fastify.register(fastifySwaggerUI, {
			routePrefix: "/docs",
			uiConfig: {
				docExpansion: "full",
				deepLinking: false,
			},
			staticCSP: true,
			transformStaticCSP: (header) => header,
		});

		fastify.logPluginLoad(pluginName);
	},
	{ name: pluginName },
);
