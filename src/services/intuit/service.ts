import createIntuitAuth from '@/services/intuit/auth';
import createIntuitCustomersService from '@/services/intuit/customers';
import createIntuitEstimatesService from '@/services/intuit/estimates';
import createIntuitItemsService from '@/services/intuit/items';
import createLogger from '@/utils/logger';
import { CreateIntuitServiceInput } from '@/utils/types';

const logger = createLogger("Intuit Service");

export interface IntuitService {
  auth: ReturnType<typeof createIntuitAuth>;
  customers: ReturnType<typeof createIntuitCustomersService>;
  estimates: ReturnType<typeof createIntuitEstimatesService>;
  items: ReturnType<typeof createIntuitItemsService>;
}
let intuitServiceInstance: IntuitService | null = null;

const createIntuitService = async (
  input: CreateIntuitServiceInput,
  callback?: (service: IntuitService) => void
): Promise<IntuitService> => {
  if (intuitServiceInstance) {
    if (callback) callback(intuitServiceInstance);
    return intuitServiceInstance;
  }

  const time = 3600000; // Re-authenticate every hour

  const establishConnection = async () => {
    const client = await createIntuitAuth(logger)
      .authenticate(input)
      .catch((err) => {
        logger.error({ message: "Error authenticating to Intuit", err });
      });

    // if (!client) return;

    intuitServiceInstance = {
      auth: createIntuitAuth(logger),
      customers: createIntuitCustomersService(client),
      estimates: createIntuitEstimatesService(client),
      items: createIntuitItemsService(client),
    };

    if (callback) callback(intuitServiceInstance);

    // Optional: refresh authentication in the background
    setInterval(establishConnection, time);
  };

  await establishConnection();
  return intuitServiceInstance;
};

export default createIntuitService;
