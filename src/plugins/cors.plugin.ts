import cors from "@fastify/cors";
import fp from "fastify-plugin";

const pluginName = "cors-plugin";

export default fp(
	async (fastify) => {
		await fastify.register(cors, {
			origin: [
				"http://localhost:5173", // dev
				"https://intern-news-project.vercel.app", // prod
			],
			credentials: true,
		});
		fastify.logPluginLoad(pluginName);
	},
	{ name: pluginName },
);
