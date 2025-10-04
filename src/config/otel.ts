import os from "node:os";
import FastifyOtelInstrumentation from "@fastify/otel";
import {
	DiagConsoleLogger,
	DiagLogLevel,
	diag,
	metrics,
} from "@opentelemetry/api";
import { FsInstrumentation } from "@opentelemetry/instrumentation-fs";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { MongoDBInstrumentation } from "@opentelemetry/instrumentation-mongodb";
import { PinoInstrumentation } from "@opentelemetry/instrumentation-pino";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
	ConsoleLogRecordExporter,
	SimpleLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import {
	ConsoleMetricExporter,
	PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

export default async function startOtel() {
	diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

	const sdk = new NodeSDK({
		traceExporter: new ConsoleSpanExporter(),
		metricReader: new PeriodicExportingMetricReader({
			exporter: new ConsoleMetricExporter(),
			exportIntervalMillis: 10000,
		}),
		logRecordProcessors: [
			new SimpleLogRecordProcessor(new ConsoleLogRecordExporter()),
		],
		instrumentations: [
			new FastifyOtelInstrumentation({
				servername: "fastify-form-app",
				registerOnInitialization: true,
				ignorePaths: (opts) => opts.url.includes("/health"),
			}),
			new FsInstrumentation(),
			new MongoDBInstrumentation(),
			new PinoInstrumentation(),
			new HttpInstrumentation(),
		],
		serviceName: "fastify-form-app",
		resource: resourceFromAttributes({
			[ATTR_SERVICE_NAME]: "fastify-form-app",
			[ATTR_SERVICE_VERSION]: "1.0.0",
			"service.environment": "development",
			"service.instance.id": "instance-1",
		}),
	});

	try {
		await sdk.start();
		console.log("🌐 OpenTelemetry Started Successfully");

		const meter = metrics.getMeter("fastify-form-app");

		// CPU usage gauge
		let lastTotal = 0;
		let lastIdle = 0;

		const cpuGauge = meter.createObservableGauge("system_cpu_percent", {
			description: "CPU usage in percent",
		});
		cpuGauge.addCallback((observableResult) => {
			const cpus = os.cpus();
			let idle = 0;
			let total = 0;

			// Get cpu info
			cpus.forEach((cpu) => {
				for (const type in cpu.times) {
					total += cpu.times[type as keyof typeof cpu.times];
				}
				idle += cpu.times.idle;
			});

			// Compare with last snapshot
			const idleDiff = idle - lastIdle;
			const totalDiff = total - lastTotal;
			const usage = 100 - (idleDiff / totalDiff) * 100;

			// Save current snapshot for next time
			lastIdle = idle;
			lastTotal = total;

			observableResult.observe(usage);
		});

		process.on("SIGTERM", async () => {
			sdk
				.shutdown()
				.then(() => console.log("❕ SDK shut down successfully"))
				.catch((err) => console.log("Error shutting down SDK", err))
				.finally(() => process.exit(0));
		});

		process.on("SIGINT", async () => {
			sdk
				.shutdown()
				.then(() => console.log("❕ SDK shut down successfully"))
				.catch((err) => console.log("Error shutting down SDK", err))
				.finally(() => process.exit(0));
		});
	} catch (error) {
		console.error("Error starting OpenTelemetry:", error);
		throw error;
	}

	return sdk;
}
