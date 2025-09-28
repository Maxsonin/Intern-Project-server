import { join } from "node:path";
import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import {
	saveLineItemFile,
	saveLineItemMetadata,
} from "../services/lineItem.service";
import type { LineItem } from "../types/lineItem";

export default async function getLineItemRoutes(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();

	route.get(
		"/lineitemformpage",
		{
			preHandler: [fastify.authenticate],
		},
		async (_, reply) => {
			const rootPath = join(__dirname, "../pages");
			return reply.sendFile("lineItemFormPage.html", rootPath);
		},
	);

	route.post(
		"/lineitemformpage",
		{
			preHandler: [fastify.authenticate],
			schema: {
				consumes: ["multipart/form-data"],
			},
		},
		async (request, reply) => {
			try {
				const data = await request.file();
				if (!data || !data.file) return reply.badRequest("No file uploaded");

				const filePath = await saveLineItemFile(fastify, data);

				console.log("filePath111111", filePath);

				const body = data as Record<string, any>;
				const lineItem: LineItem = {
					size: body.fields.size.value,
					geo: body.fields.geo.value,
					adType: body.fields.adType.value,
					min_cpm: Number(body.fields.min_cpm.value),
					max_cpm: Number(body.fields.max_cpm.value),
					frequency: Number(body.fields.frequency.value),
					filePath,
				};

				console.log("lineItem222222", lineItem);

				const savedItem = await saveLineItemMetadata(fastify, lineItem);

				console.log("filePath", savedItem);

				reply.send(savedItem);
			} catch (error) {
				fastify.log.error({ error }, "Error uploading file");
				reply.internalServerError("Failed to upload file");
			}
		},
	);
}
