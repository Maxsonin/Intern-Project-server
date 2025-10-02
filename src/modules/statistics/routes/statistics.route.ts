import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import ExcelJS from "exceljs";
import type { FastifyInstance } from "fastify";
import { EventSchema, FilterSchema } from "../schemas/statistics.schema";
import {
	createFilterConditions,
	getData,
	getTotalPages,
	saveEventsToDB,
	transformEvent,
} from "../services/statistics.service";
import type { EventElement } from "../types/statistics";

export default async function getStatisticsRoutes(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();

	const eventsCache = new Set<EventElement>();
	const MAX_CACHE_SIZE = 10;
	const FLUSH_INTERVAL_MS = 1000 * 60 * 60; // 1 hour
	let lastFlushTime = Date.now();

	const MAX_ROW_LIMIT = 10000;

	route.post("/events", { schema: EventSchema }, async (request) => {
		request.body.forEach((event) => {
			eventsCache.add(transformEvent(event, request.ip));
		});

		if (
			eventsCache.size >= MAX_CACHE_SIZE ||
			Date.now() - lastFlushTime >= FLUSH_INTERVAL_MS
		) {
			try {
				await saveEventsToDB(fastify, Array.from(eventsCache));
				eventsCache.clear();
				lastFlushTime = Date.now();
			} catch {
				fastify.httpErrors.internalServerError("Failed to insert event");
			}
		}
	});

	route.post(
		"/stat/events",
		{ schema: FilterSchema, preHandler: [fastify.authenticate] },
		async (request) => {
			const body = request.body;
			const { columns, filters, pagination, sort } = body;

			try {
				const whereClause = createFilterConditions(filters ?? {});

				const data = await getData(
					fastify,
					whereClause,
					pagination?.limit ?? 50,
					pagination?.page ?? 1,
					columns,
					sort,
				);

				const { total, totalPages } = await getTotalPages(
					fastify,
					whereClause,
					pagination?.limit ?? 50,
				);

				return {
					data,
					pagination: {
						total,
						limit: pagination?.limit ?? 50,
						page: pagination?.page ?? 1,
						totalPages,
					},
				};
			} catch {
				fastify.httpErrors.internalServerError("Failed to get events");
			}
		},
	);

	route.post(
		"/stat/events/export/csv",
		{ schema: FilterSchema, preHandler: [fastify.authenticate] },
		async (request, reply) => {
			const body = request.body;
			const { columns, filters, sort } = body;

			try {
				const whereClause = createFilterConditions(filters ?? {});

				const data = await getData(
					fastify,
					whereClause,
					MAX_ROW_LIMIT,
					1,
					columns,
					sort,
				);

				const workbook = new ExcelJS.Workbook();
				const sheet = workbook.addWorksheet();

				sheet.addRow(columns);

				data.forEach((row) => {
					sheet.addRow(columns.map((col) => row[col]));
				});

				const buffer = await workbook.csv.writeBuffer();

				reply
					.header("Content-Type", "text/csv")
					.header("Content-Disposition", "attachment; filename=events.csv")
					.send(buffer);
			} catch {
				fastify.httpErrors.internalServerError("Failed to create CSV file");
			}
		},
	);

	route.post(
		"/stat/events/export/xlsx",
		{ schema: FilterSchema, preHandler: [fastify.authenticate] },
		async (request, reply) => {
			const body = request.body;
			const { columns, filters, sort } = body;

			try {
				const whereClause = createFilterConditions(filters ?? {});

				const data = await getData(
					fastify,
					whereClause,
					MAX_ROW_LIMIT,
					1,
					columns,
					sort,
				);

				const workbook = new ExcelJS.Workbook();
				const sheet = workbook.addWorksheet("Events");

				sheet.addRow(columns);

				data.forEach((row) => {
					sheet.addRow(columns.map((col) => row[col]));
				});

				const buffer = await workbook.xlsx.writeBuffer();

				reply
					.header(
						"Content-Type",
						"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
					)
					.header("Content-Disposition", "attachment; filename=events.xlsx")
					.send(buffer);
			} catch {
				fastify.httpErrors.internalServerError("Failed to create XLSX file");
			}
		},
	);
}
