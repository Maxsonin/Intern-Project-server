import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import { getNewsfeedHandler } from "../controller/newsfeed.controller";
import { getNewsfeedSchema } from "../schemas/getNewsfeed.schema";

export async function getFeedDataRoutes(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();

	route.get("/newsfeed", { schema: getNewsfeedSchema }, getNewsfeedHandler);
}
