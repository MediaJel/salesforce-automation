import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: process.env.GRAPHQL_ENDPOINT,
  documents: ["src/**/*.ts"],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./src/services/graphql/generated/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;
