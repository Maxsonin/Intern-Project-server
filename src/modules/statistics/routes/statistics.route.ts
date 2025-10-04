import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";

import type { FastifyInstance } from "fastify";
import { EventSchema, FilterSchema } from "../schemas/statistics.schema";
import {
	exportCSV,
	exportExel,
	getEvents,
	handlePostEvent,
} from "../services/statistics.service";

export default async function getStatisticsRoutes(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();

	route.post("/events", { schema: EventSchema }, async (request) => {
		handlePostEvent(fastify, request.body, request.ip);
	});

	route.post(
		"/stat/events",
		{ schema: FilterSchema, preHandler: [fastify.authenticate] },
		async (request) => {
			const {
				columns,
				filters = {},
				pagination = { page: 1, limit: 50 },
				sort = { field: "timestamp", order: "desc" },
			} = request.body;
			return getEvents(fastify, columns, filters, pagination, sort);
		},
	);

	route.post(
		"/stat/events/export/csv",
		{ schema: FilterSchema, preHandler: [fastify.authenticate] },
		async (request, reply) => {
			const {
				columns,
				filters = {},
				sort = { field: "timestamp", order: "desc" },
			} = request.body;

			const buffer = await exportCSV(fastify, columns, filters, sort);

			reply
				.header("Content-Type", "text/csv")
				.header("Content-Disposition", "attachment; filename=events.csv")
				.send(buffer);
		},
	);

	route.post(
		"/stat/events/export/xlsx",
		{ schema: FilterSchema, preHandler: [fastify.authenticate] },
		async (request, reply) => {
			const {
				columns,
				filters = {},
				sort = { field: "timestamp", order: "desc" },
			} = request.body;

			const buffer = await exportExel(fastify, columns, filters, sort);

			reply
				.header(
					"Content-Type",
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				)
				.header("Content-Disposition", "attachment; filename=events.xlsx")
				.send(buffer);
		},
	);
}
