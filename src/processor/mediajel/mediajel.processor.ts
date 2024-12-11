// import { DEFAULT_EMAIL, DEFAULT_ORG, DEFAULT_PHONE } from "@/constants";
// import processorState from "@/processor/state";
// import createGraphqlService from "@/services/graphql";
// import createLogger from "@/utils/logger";
// import { Config, DataProducer, Org, SalesforceClosedWonResource } from "@/utils/types";
// import { format, formatPhone, isProduction } from "@/utils/utils";

// const logger = createLogger("GraphQL Processor");

// const log = (msg?: string, data?: any) => {
//   const json = { message: msg, data };
//   logger.info(JSON.stringify(json, null, 2));
// };
// const logWarn = (msg?: string, data?: any) => {
//   const json = { message: msg, data };
//   logger.warn(JSON.stringify(json, null, 2));
// };

// const createMediajelProcessor = (config: Config) => {
//   const graphql = createGraphqlService(config.graphql);
//   logger.info("Registered Mediajel Processor");

//   const createOrgs = async (resources: SalesforceClosedWonResource[]) => {
//     const orgs: Org[] = [];

//     for (const resource of resources) {
//       const { id, name, parentId } = resource;

//       const parentOrg = await graphql.queries.getOrgBySalesforceId({
//         salesforceId: parentId,
//       });

//       // The eldest org should use the default org
//       if (orgs.length === 0) {
//         await graphql.findOrCreateOrg({
//           name,
//           salesforceId: id,

//           parentOrgId: DEFAULT_ORG,
//         });
//         log(`Associated ${name} with default Mediajel org`);
//       }

//       const childOrg = await graphql.findOrCreateOrg({
//         name,
//         salesforceId: id,

//         parentOrgId: parentOrg?.id || DEFAULT_ORG,
//       });

//       orgs.push(childOrg);
//     }

//     log("Created/Found Orgs", orgs);
//     return orgs;
//   };

//   const createUsers = async (orgs: Org[], resources: SalesforceClosedWonResource[]) => {
//     const promises = resources.map(async (resource) => {
//       const { id, name, user = null } = resource;
//       const org = orgs.find((org) => org.salesforceId === id);
//       if (!org) return logger.warn(`No Org Found for Candidate ${name}`);
//       if (!user) return logger.warn(`No User Found for Candidate ${name}`);

//       return await graphql.findOrCreateUser({
//         salesforceId: user.id,
//         email: isProduction ? user.email : DEFAULT_EMAIL,
//         name: format(user.name),
//         username: format(user.name),
//         orgId: org.id,
//         phone: user?.phone ? formatPhone(user.phone) : DEFAULT_PHONE, // Always add a +1
//       });
//     });

//     const users = (await Promise.all(promises)).filter((user) => !!user);

//     log("Created/Found Users", users);
//   };

//   return {
//     process: async (type: string, resources: SalesforceClosedWonResource[]) => {
//       if (!processorState.state()) {
//         return logger.warn("Disabled app state, not processing...");
//       }

//       const orgs = await createOrgs(resources);
//       await createUsers(orgs, resources);
//     },
//   };
// };

// export default createMediajelProcessor;
