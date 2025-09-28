import fastifyCron from "fastify-cron";
import fp from "fastify-plugin";
import { refreshNewsfeed } from "../modules/newsfeed/services/newsfeed.service";

const pluginName = "cron-plugin";

export default fp(
	async (fastify) => {
		const cronTime = fastify.config.NEWSFEED_REFRESH_CRON;

		fastify.register(fastifyCron, {
			jobs: [
				{
					cronTime: cronTime,
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
