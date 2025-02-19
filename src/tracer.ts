"use strict";

import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { NestInstrumentation } from "@opentelemetry/instrumentation-nestjs-core";
import { PinoInstrumentation } from "@opentelemetry/instrumentation-pino";
import { Resource } from "@opentelemetry/resources";
import * as opentelemetry from "@opentelemetry/sdk-node";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

// Configure the SDK to export telemetry data to the console
// Enable all auto-instrumentations from the meta package
const exporterOptions = {
  url: "http://otelcollector.dmp.cnna.io/v1/traces",
};
// http://localhost:4318/v1/traces

const traceExporter = new OTLPTraceExporter(exporterOptions);
const sdk = new opentelemetry.NodeSDK({
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations(),
    new NestInstrumentation(),
    new PinoInstrumentation(),
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "salesforce-automation",
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || "local",
  }),
});

// initialize the SDK and register with the OpenTelemetry API
// this enables the API to record telemetry
sdk.start();

// gracefully shut down the SDK on process exit
process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(() => console.log("Tracing terminated"))
    .catch((error) => console.log("Error terminating tracing", error))
    .finally(() => process.exit(0));
});

export default sdk;
