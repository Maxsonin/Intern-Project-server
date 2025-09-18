import sensible from "@fastify/sensible";
import fp from "fastify-plugin";

const pluginName = "sensible-plugin";

export default fp(
	async (fastify) => {
		fastify.register(sensible);
		fastify.logPluginLoad(pluginName);
	},
	{ name: pluginName },
);
