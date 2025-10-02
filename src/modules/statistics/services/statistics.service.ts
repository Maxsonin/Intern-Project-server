import type { FastifyInstance } from "fastify";
import geoip from "geoip-lite";
import { TABLE_NAME } from "../../../config/clickhouse";
import type {
	EventBodyItem,
	FilterBodyFilters,
	FilterBodySort,
} from "../schemas/statistics.schema";
import type { EventElement } from "../types/statistics";

export async function saveEventsToDB(
	fastify: FastifyInstance,
	events: EventElement[],
) {
	if (!events.length) return;

	try {
		await fastify.clickhouse.insert({
			table: TABLE_NAME,
			values: events,
			format: "JSONEachRow",
		});
	} catch (err) {
		fastify.log.error("Failed to insert events:", err);
		throw err;
	}
}

function formatTimestampForClickHouse(date: Date): string {
	const yyyy = date.getUTCFullYear();
	const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
	const dd = String(date.getUTCDate()).padStart(2, "0");
	const hh = String(date.getUTCHours()).padStart(2, "0");
	const min = String(date.getUTCMinutes()).padStart(2, "0");
	const ss = String(date.getUTCSeconds()).padStart(2, "0");

	return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

export function transformEvent(body: EventBodyItem, ip: string): EventElement {
	return {
		eventType: body.eventType,

		timestamp: formatTimestampForClickHouse(new Date()),

		countryCode: geoip.lookup(ip)?.country ?? "Unknown",
		deviceType: body.deviceType,

		adapter: body.adapter ?? null,
		creativeId: body.creativeId ?? null,
		cpm: body.cpm ?? null,
	};
}

export function createFilterConditions(filters: FilterBodyFilters): string {
	const conditions: string[] = [];

	// Helper to handle IN clauses
	const addInCondition = (field: string, values?: string[]) => {
		if (values && values.length > 0) {
			const inClause = values.map((v) => `'${v}'`).join(", ");
			conditions.push(`${field} IN (${inClause})`);
		}
	};

	// Helper to handle equality
	const addEqCondition = (field: string, value?: string | number) => {
		if (value !== undefined) {
			conditions.push(`${field} = '${value}'`);
		}
	};

	addInCondition("eventType", filters.eventType);
	addInCondition("deviceType", filters.deviceType);
	addInCondition("adapter", filters.adapter);

	addEqCondition("creativeId", filters.creativeId);
	addEqCondition("countryCode", filters.countryCode);

	if (filters.cpm) {
		if (filters.cpm.eq !== undefined) {
			conditions.push(`cpm = ${filters.cpm.eq}`);
		}
		if (filters.cpm.gte !== undefined) {
			conditions.push(`cpm >= ${filters.cpm.gte}`);
		}
		if (filters.cpm.lte !== undefined) {
			conditions.push(`cpm <= ${filters.cpm.lte}`);
		}
	}

	if (filters.timestamp) {
		if (filters.timestamp.from) {
			conditions.push(
				`timestamp >= toDateTime('${formatTimestampForClickHouse(new Date(filters.timestamp.from))}')`,
			);
		}
		if (filters.timestamp.to) {
			conditions.push(
				`timestamp <= toDateTime('${formatTimestampForClickHouse(new Date(filters.timestamp.to))}')`,
			);
		}
	}

	return conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
}

export async function getData(
	fastify: FastifyInstance,
	filterString: string,
	limit: number = 50,
	page: number = 1,
	columns: string[] = ["*"],
	sort?: FilterBodySort,
): Promise<EventElement[]> {
	const offset = (page - 1) * limit;

	const selectClause = columns.length > 0 ? columns.join(", ") : "*";

	try {
		const orderClause = sort
			? `ORDER BY ${sort.field} ${sort.order.toUpperCase()}`
			: "ORDER BY timestamp DESC";

		const dataQuery = `
			SELECT ${selectClause.replace("timestamp", "toTimeZone(timestamp, 'Europe/Kyiv') AS timestamp")}
			FROM events
			${filterString}
			${orderClause}
			LIMIT ${limit} OFFSET ${offset}
		`;

		const data = (await fastify.clickhouse
			.query({ query: dataQuery, format: "JSONEachRow" })
			.then((res) => res.json())) as EventElement[];

		return data;
	} catch (err) {
		fastify.log.error("Failed to get events:", err);
		throw err;
	}
}

export async function getTotalPages(
	fastify: FastifyInstance,
	filterString: string,
	limit: number,
) {
	try {
		const totalResult = (await fastify.clickhouse
			.query({
				query: `SELECT count(*) AS total FROM events ${filterString}`,
				format: "JSONEachRow",
			})
			.then((res) => res.json())) as Array<{ total: number }>;

		const total = totalResult[0]?.total ?? 0;
		const totalPages = Math.ceil(total / limit);
		return { total, totalPages };
	} catch (error) {
		fastify.log.error("Failed to get total pages:", error);
		throw error;
	}
}
