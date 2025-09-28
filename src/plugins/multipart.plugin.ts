import multipart from "@fastify/multipart";
import fp from "fastify-plugin";

const pluginName = "multipart-plugin";

export default fp(
	async (fastify) => {
		fastify.register(multipart);
		fastify.logPluginLoad(pluginName);
	},
	{ name: pluginName },
);
