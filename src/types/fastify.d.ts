import "@fastify/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Config } from "../config/schema";
import type { PrismaClient } from "@prisma/client";

declare module "@fastify/jwt" {
	interface FastifyJWT {
		payload: { id: string };
		user: { id: string };
	}
}

declare module "fastify" {
	interface FastifyInstance {
		config: Config;
		prisma: PrismaClient;

		logPluginLoad: (pluginName: string) => void;

		authenticate: (
			request: FastifyRequest,
			reply: FastifyReply,
		) => Promise<void>;

		jwt: import("@fastify/jwt").FastifyJWT;
	}
}
