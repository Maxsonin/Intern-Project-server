import { join } from "node:path";
import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import {
	lineItemCreateSchema,
	lineItemPageSchema,
} from "../schemas/lineItem.schema";
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
			schema: lineItemPageSchema,
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
			schema: lineItemCreateSchema,
			preHandler: [fastify.authenticate],
		},
		async (request, reply) => {
			try {
				const data = await request.file();
				if (!data || !data.file) return reply.badRequest("No file uploaded");

				const fileName = await saveLineItemFile(fastify, data);

				const { fields } = data as {
					fields: Record<string, { value: string }>;
				};

				const { size, geo, adType, min_cpm, max_cpm, frequency } = fields;

				const lineItem: LineItem = {
					size: size.value,
					geo: geo.value,
					adType: adType.value,
					min_cpm: Number(min_cpm.value),
					max_cpm: Number(max_cpm.value),
					frequency: Number(frequency.value),
					fileName,
				};
				const savedItem = await saveLineItemMetadata(fastify, lineItem);

				reply.send(savedItem);
			} catch (error) {
				fastify.log.error({ error }, "Error uploading file");
				reply.internalServerError("Failed to upload file");
			}
		},
	);
}
