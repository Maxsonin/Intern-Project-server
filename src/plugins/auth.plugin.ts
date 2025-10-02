import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import fp from "fastify-plugin";

const pluginName = "auth-plugin";

export default fp(
	async (fastify) => {
		await fastify.register(cookie);

		await fastify.register(jwt, {
			secret: fastify.config.JWT_SECRET,
			cookie: {
				cookieName: "access_token",
				signed: false,
			},
			sign: {
				expiresIn: "30m",
			},
		});

		fastify.decorate("authenticate", async (request, reply) => {
			try {
				await request.jwtVerify({ onlyCookie: true });
			} catch {
				return reply.unauthorized();
			}
		});

		fastify.logPluginLoad(pluginName);
	},
	{ name: pluginName },
);
