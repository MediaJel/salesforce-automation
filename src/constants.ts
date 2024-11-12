import { isProduction } from "@/utils/utils";

const DOJO_MEDIAJEL_ORG = "cjoq2t7g4yzca07347pug25ck";

const PROD_MEDIAJEL_ORG = "cjpkhilv4es4q0722xgsd8k12";

export const DEFAULT_ORG = isProduction ? PROD_MEDIAJEL_ORG : DOJO_MEDIAJEL_ORG; // Mediajel Org, make this dynamic for different environments

export const DEFAULT_EMAIL = "pacholo@mediajel.com";

export const DEFAULT_PHONE = "+11234567894";

export const DEFAULT_SERVER_PORT = 1234;

export const DEFAULT_LOG_LEVEL = "INFO";
