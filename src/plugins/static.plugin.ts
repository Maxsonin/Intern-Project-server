import { join } from "node:path";
import fastifyStatic from "@fastify/static";
import fp from "fastify-plugin";

const pluginName = "static-plugin";

export default fp(
	async (fastify) => {
		fastify.register(fastifyStatic, {
			root: join(__dirname, "../uploads"),
			prefix: "/ad/",
		});
		fastify.logPluginLoad(pluginName);
	},
	{ name: pluginName },
);
