import bcrypt from "bcrypt";
import type { FastifyInstance, FastifyReply } from "fastify";
import type { SignInSchema, SignUpSchema } from "../schemas/auth.schema";

export async function signup(fastify: FastifyInstance, input: SignUpSchema) {
	const hashedPassword = await bcrypt.hash(input.password, 10);
	const user = await fastify.prisma.user.create({
		data: { ...input, password: hashedPassword },
	});
	return { id: user.id, email: user.email, name: user.name };
}

export async function signin(
	fastify: FastifyInstance,
	input: SignInSchema,
	reply: FastifyReply,
) {
	const user = await fastify.prisma.user.findUnique({
		where: { email: input.email },
	});
	if (!user) throw fastify.httpErrors.unauthorized();

	const valid = await bcrypt.compare(input.password, user.password);
	if (!valid) throw fastify.httpErrors.unauthorized();

	const token = fastify.jwt.sign({ id: user.id });
	reply
		.setCookie("access_token", token, {
			httpOnly: true,
			path: "/",
			sameSite: true,
			secure: fastify.config.NODE_ENV === "production",
		})
		.send({ id: user.id, email: user.email, name: user.name });
}

export async function me(fastify: FastifyInstance, userId: string) {
	const user = await fastify.prisma.user.findUnique({ where: { id: userId } });
	if (!user) throw fastify.httpErrors.unauthorized();
	return { id: user.id, email: user.email, name: user.name };
}
