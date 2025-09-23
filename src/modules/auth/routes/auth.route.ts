import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import { signInSchema, signUpSchema } from "../schemas/auth.schema";
import { me, signin, signup } from "../services/auth.service";

export default async function authRoutes(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();

	route.post("/auth/signup", { schema: signUpSchema }, async (request) => {
		return signup(fastify, request.body);
	});

	route.post(
		"/auth/signin",
		{ schema: signInSchema },
		async (request, reply) => {
			return signin(fastify, request.body, reply);
		},
	);

	route.get(
		"/auth/me",
		{
			preHandler: [fastify.authenticate],
		},
		async (request) => {
			return me(fastify, request.user.id);
		},
	);

	route.post(
		"/auth/logout",
		{
			preHandler: [fastify.authenticate],
		},
		async (_request, reply) => {
			reply.clearCookie("access_token", { path: "/" });
			return { success: true };
		},
	);
}
