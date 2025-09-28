import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import type { MultipartFile } from "@fastify/multipart";
import type { FastifyInstance } from "fastify";

import type { LineItem } from "../types/lineItem";

export async function saveLineItemMetadata(
	fastify: FastifyInstance,
	data: LineItem,
) {
	return fastify.prisma.lineItem.create({
		data: {
			size: data.size,
			min_cpm: data.min_cpm,
			max_cpm: data.max_cpm,
			geo: data.geo,
			adType: data.adType,
			frequency: data.frequency,
			filePath: data.filePath,
		},
	});
}

export async function saveLineItemFile(
	fastify: FastifyInstance,
	data: MultipartFile,
) {
	fastify.log.info(`Uploading file ${data.filename} to server`);

	const uploadDir = path.join(process.cwd(), "uploads");
	await fs.promises.mkdir(uploadDir, { recursive: true });
	const filePath = path.join(uploadDir, data.filename);

	await pipeline(data.file, fs.createWriteStream(filePath));

	return filePath;
}
