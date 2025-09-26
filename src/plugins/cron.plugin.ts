import fastifyCron from "fastify-cron";
import fp from "fastify-plugin";
import { refreshNewsfeed } from "../modules/newsfeed/services/newsfeed.service";

const pluginName = "cron-plugin";

export default fp(
	async (fastify) => {
		fastify.register(fastifyCron, {
			jobs: [
				{
					cronTime: "0 0 * * 1", // every Monday at 00:00
					onTick: async () => {
						await refreshNewsfeed(fastify);
					},
				},
			],
		});
		fastify.logPluginLoad(pluginName);
	},
	{ name: pluginName },
);
