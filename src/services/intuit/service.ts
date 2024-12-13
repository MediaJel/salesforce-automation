import createIntuitAuth from "@/services/intuit/auth";
import createIntuitCustomersService from "@/services/intuit/customers";
import createIntuitEstimatesService from "@/services/intuit/estimates";
import createIntuitItemsService from "@/services/intuit/items";
import createLogger from "@/utils/logger";
import { CreateIntuitServiceInput } from "@/utils/types";

const logger = createLogger("Intuit Service");

export interface IntuitService {
  customers: ReturnType<typeof createIntuitCustomersService>;
  estimates: ReturnType<typeof createIntuitEstimatesService>;
  items: ReturnType<typeof createIntuitItemsService>;
}

const createIntuitService = async (input: CreateIntuitServiceInput): Promise<IntuitService> => {
  try {
    await createIntuitAuth()
      .authenticate(input)
      .catch((err) => {
        logger.error({ message: "Error authenticating to Intuit", err });
      });

    return {
      customers: createIntuitCustomersService(),
      estimates: createIntuitEstimatesService(),
      items: createIntuitItemsService(),
    };
  } catch (err) {
    logger.error({ message: "Error authenticating to Intuit", err });
  }
};

export default createIntuitService;
