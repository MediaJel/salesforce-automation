import { Config, DataProducer, Org, OrgCreationCandidate } from "@/utils/types";
import { DEFAULT_EMAIL, DEFAULT_ORG, DEFAULT_PHONE } from "@/constants";
import { isProduction, format, formatPhone } from "@/utils/utils";

import createGraphqlService from "@/services/graphql";
import createLogger from "@/utils/logger";
import appState from "@/state";

const logger = createLogger("Processor");

// Use a logging library
const log = (msg?: string, data?: any) => {
  const json = { message: msg, data };
  logger.info(JSON.stringify(json, null, 2));
};
const logWarn = (msg?: string, data?: any) => {
  const json = { message: msg, data };
  logger.warn(JSON.stringify(json, null, 2));
};

const createProcessor = (producer: DataProducer, config: Config) => {
  const graphql = createGraphqlService(config.graphql);

  const createOrgs = async (candidates: OrgCreationCandidate[]) => {
    const orgs: Org[] = [];
    for (const candidate of candidates) {
      const { id, name, description, parentId } = candidate;

      const parentOrg = await graphql.queries.getOrgBySalesforceId({
        salesforceId: parentId,
      });

      const childOrg = await graphql.findOrCreateOrg({
        name,
        salesforceId: id,
        description,
        parentOrgId: parentOrg?.id || DEFAULT_ORG,
      });

      orgs.push(childOrg);
    }
    log("Created/Found Orgs", orgs);
    return orgs;
  };

  const createUsers = async (
    orgs: Org[],
    candidates: OrgCreationCandidate[]
  ) => {
    const promises = candidates.map(async (candidate) => {
      const { id, name, user = null } = candidate;
      const org = orgs.find((org) => org.salesforceId === id);
      if (!org) return logger.warn(`No Org Found for Candidate ${name}`);
      if (!user) return logger.warn(`No User Found for Candidate ${name}`);

      return await graphql.findOrCreateUser({
        salesforceId: user.id,
        email: isProduction ? user.email : DEFAULT_EMAIL,
        name: format(user.name),
        username: format(user.name),
        orgId: org.id,
        phone: user?.phone ? formatPhone(user.phone) : DEFAULT_PHONE, // Always add a +1
      });
    });

    const users = (await Promise.all(promises)).filter((user) => !!user);

    log("Created/Found Users", users);
  };

  return {
    async listen() {
      producer.orgs.display(async (candidates) => {
        log("Received Display Org Candidates", candidates);

        if (!appState.state()) {
          return logWarn("Disabled app state, not processing...", candidates);
        }

        const orgs = await createOrgs(candidates);

        const users = await createUsers(orgs, candidates);
      });

      producer.orgs.paidSearch(async (candidates) => {
        log("Received Paid Search Org Candidates", candidates);
        if (!appState.state()) {
          return logWarn("Disabled app state, not processing...", candidates);
        }

        const orgs = await createOrgs(candidates);

        const users = await createUsers(orgs, candidates);
      });

      producer.orgs.seo(async (candidates) => {
        log("Received SEO Org Candidates", candidates);
        if (!appState.state()) {
          return logWarn("Disabled app state, not processing...", candidates);
        }

        const orgs = await createOrgs(candidates);

        const users = await createUsers(orgs, candidates);
      });
    },
  };
};

export default createProcessor;
