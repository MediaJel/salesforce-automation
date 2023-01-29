import { Config, DataProducer, Org, OrgCreationCandidate } from "@/utils/types";
import { DEFAULT_EMAIL, DEFAULT_ORG, DEFAULT_PHONE } from "@/constants";
import { isProduction, format, formatPhone } from "@/utils/utils";

import createGraphqlService from "@/services/graphql";
import createLogger from "@/utils/logger";

const logger = createLogger("Processor");

const log = (msg?: string, data?: any) => {
  const json = { message: msg, data };
  logger.info(JSON.stringify(json, null, 2));
};

const createProcessor = (producer: DataProducer, config: Config) => {
  const graphql = createGraphqlService(config.graphql);

  const sort = (arr: OrgCreationCandidate[]) => {
    // Organizes the array so that it is in the correct order for Org creation
    // (I.E. The parent org is created before the child org)
    const sorted = arr.sort((a, b) => {
      if (a.parentId === b.id) return 1;
      if (a.id === b.parentId) return -1;
      return 0;
    });
    return sorted;
  };

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
    return orgs;
  };

  const createUsers = async (
    orgs: Org[],
    candidates: OrgCreationCandidate[]
  ) => {
    candidates.forEach(async (candidate) => {
      const { id, name, user = null } = candidate;
      const org = orgs.find((org) => org.salesforceId === id);
      if (!org) return logger.warn(`No Org Found for Candidate ${name}`);
      if (!user) return logger.warn(`No User Found for Candidate ${name}`);

      const orgUser = await graphql.findOrCreateUser({
        salesforceId: user.id,
        email: isProduction ? user.email : DEFAULT_EMAIL,
        name: format(user.name),
        username: format(user.name),
        orgId: org.id,
        phone: user?.phone ? formatPhone(user.phone) : DEFAULT_PHONE, // Always add a +1
      });
    });
  };

  return {
    async listen() {
      producer.orgs.display(async (candidates) => {
        log("Received Display Org Candidates", candidates);

        const sorted = sort(candidates);

        const orgs = await createOrgs(sorted);
        log("Created Display Orgs", orgs);

        const users = await createUsers(orgs, sorted);
      });

      producer.orgs.paidSearch(async (candidates) => {
        // log("Received Paid Search Org Candidates", candidates);
        // const sorted = sort(candidates);
        // const orgs = await createOrgs(sorted);
        // log("Created Paid Search Orgs", orgs);
      });

      producer.orgs.seo(async (candidates) => {
        // log("Received SEO Org Candidates", candidates);
        // const sorted = sort(candidates);
        // const orgs = await createOrgs(sorted);
        // log("Created SEO Orgs", orgs);
      });
    },
  };
};

export default createProcessor;
