import { Client } from "urql";
import { CreateOrgParams, CreateUserParams, Logger } from "@/utils/types";
import {
  PartnerLevel,
  Feature,
  FeatureActions,
} from "@/services/graphql/generated/graphql";

import mutations from "@/services/graphql/resolvers/mutations";

const createGraphqlMutations = (client: Client, logger: Logger) => {
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
          logger.error("Error running createUser");
          throw err;
        });

      logger.debug(`Created User: ${operation.data.createDashboardUser.id}`);

      return operation.data.createDashboardUser;
    },
    async createOrg({ name, description, salesforceId }: CreateOrgParams) {
      const operation = await client
        .mutation(mutations.CREATE_ORG, {
          name,
          description,
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
              feature: Feature.Enabled,
              actions: {
                set: [FeatureActions.Read, FeatureActions.Write],
              },
            },
          ], //! THESE MUST BE ENABLED OTHERWISE USER CANT BE DELETED
          seo: false,
          signInLogoId: null,
          storageBucket: null,
          tradeDeskIdentifier: null,
          viewId: null,
          isGA4: false,
          parentOrgs: [{ id: "cjlwwzv86hn3q0726mqm60q3f" }],
        })
        .toPromise()
        .catch((err) => {
          logger.error("Error running createOrg");
          throw err;
        });

      logger.debug(`Created Org: ${operation.data.createOrg.id}`);

      return operation.data.createOrg;
    },
  };
};

export default createGraphqlMutations;
