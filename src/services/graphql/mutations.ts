import { Client } from "@urql/core";
import {
  CreateOrgParams,
  CreateUserParams,
  Logger,
  UpdateOrgParams,
} from "@/utils/types";
import {
  PartnerLevel,
  Feature,
  FeatureActions,
} from "@/services/graphql/generated/graphql";

import mutations from "@/services/graphql/resolvers/mutations";
import createLimiter from "@/utils/limiter";

const createGraphqlMutations = (client: Client, logger: Logger) => {
  const userLimiter = createLimiter<string>(10);
  const orgLimiter = createLimiter<string>(10);

  return {
    async createUser(params: CreateUserParams) {
      const operation = await client
        .mutation(mutations.CREATE_USER, {
          email: params.email,
          config: {
            articles: false,
            campaignSummary: false,
            canResetPasswords: false,
            exportData: false,
            hasInsights: false,
            isAdmin: false,
            isDemo: false,
            isPacing: false,
            isPartner: false,
            isProcessor: false,
            isSelfService: false,
            isTrafficker: false,
            pastData: false,
            priceVisible: false,
            providersVisible: false,
            segment: false,
            technicalSupport: false,
          },
          orgId: params.orgId,
          name: params.name,
          phone: params.phone,
          username: params.username,
          avatar: null,
          roleItems: [],
        })
        .toPromise()
        .catch((err) => {
          throw err;
        });

      if (operation?.error) {
        logger.error({ message: "createUser failed", ...params });
        logger.error(operation.error);
        return null;
      }

      userLimiter.add(operation.data.createDashboardUser.id);

      return operation.data.createDashboardUser;
    },
    async createOrg(params: CreateOrgParams) {
      const { salesforceId, name, description, parentOrgId } = params;

      const operation = await client
        .mutation(mutations.CREATE_ORG, {
          name,
          description,
          salesforceId,
          website: "",
          level: PartnerLevel.Standard,
          appIds: [],
          chatWootId: "",
          config: {},
          cpm: "7",
          domain: null,
          googleCustomerId: null,
          logoId: null,
          reTargeting: false,
          roleitems: [
            {
              feature: Feature.Orgs,
              actions: {
                set: [FeatureActions.Read, FeatureActions.Write],
              },
            },
            {
              feature: Feature.Enabled,
              actions: {
                set: [FeatureActions.Read, FeatureActions.Write],
              },
            },
          ], //! THESE MUST BE ENABLED OTHERWISE USER CANT BE DELETED
          seo: false,
          storageBucket: null,
          tradeDeskIdentifier: null,
          viewId: null,
          isGA4: false,
          parentOrgs: [{ id: parentOrgId }],
        })
        .toPromise()
        .catch((err) => {
          throw err;
        });

      if (operation.error) {
        logger.error({ message: "createOrg failed", ...params });
        logger.error(operation.error);
        return null;
      }

      orgLimiter.add(operation.data.createOrg.id);

      return operation.data.createOrg;
    },

    async updateOrg(params: UpdateOrgParams) {
      const operation = await client
        .mutation(mutations.UPDATE_ORG, params)
        .toPromise()
        .catch((err) => {
          throw err;
        });

      if (operation.error) {
        logger.error({ message: "updateOrg failed", ...params });
        logger.error(operation.error);
        return null;
      }

      return operation.data.updateOrg;
    },
  };
};

export default createGraphqlMutations;
