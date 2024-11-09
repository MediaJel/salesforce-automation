import { DEFAULT_EMAIL, DEFAULT_ORG, DEFAULT_PHONE } from '@/constants';
import processorState from '@/processor/state';
import createGraphqlService from '@/services/graphql';
import createLogger from '@/utils/logger';
import { Config, DataProducer, Org, OrgCreationCandidate } from '@/utils/types';
import { format, formatPhone, isProduction } from '@/utils/utils';

const logger = createLogger("GraphQL Processor");

const log = (msg?: string, data?: any) => {
  const json = { message: msg, data };
  logger.info(JSON.stringify(json, null, 2));
};
const logWarn = (msg?: string, data?: any) => {
  const json = { message: msg, data };
  logger.warn(JSON.stringify(json, null, 2));
};

const createGraphqlProcessor = (config: Config) => {
  const graphql = createGraphqlService(config.graphql);
  logger.info("Registered GraphQL Processor");

  const createOrgs = async (candidates: OrgCreationCandidate[]) => {
    const orgs: Org[] = [];

    for (const candidate of candidates) {
      const { id, name, description, parentId } = candidate;

      const parentOrg = await graphql.queries.getOrgBySalesforceId({
        salesforceId: parentId,
      });

      // The eldest org should use the default org
      if (orgs.length === 0) {
        await graphql.findOrCreateOrg({
          name,
          salesforceId: id,
          description,
          parentOrgId: DEFAULT_ORG,
        });
        log(`Associated ${name} with default Mediajel org`);
      }

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

  const createUsers = async (orgs: Org[], candidates: OrgCreationCandidate[]) => {
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
    process: async (type: string, candidates: OrgCreationCandidate[]) => {
      if (!processorState.state()) {
        return logger.warn("Disabled app state, not processing...");
      }

      const orgs = await createOrgs(candidates);
      await createUsers(orgs, candidates);
    },
  };
};

export default createGraphqlProcessor;
