import createIntuitAuth from "@/services/intuit/auth";
import createIntuitEstimatesService from "@/services/intuit/estimates";
import createLogger from "@/utils/logger";
import { CreateIntuitServiceInput } from "@/utils/types";

const logger = createLogger("Intuit Service");

interface IntuitService {
  estimates: ReturnType<typeof createIntuitEstimatesService>;
}

const createIntuitService = (input: CreateIntuitServiceInput, callback: (service: IntuitService) => void) => {
  const time = 3600000; // Re-authenticate every hour

  const establishConnection = async () => {
    const client = await createIntuitAuth(logger)
      .authenticate(input)
      .catch((err) => {
        logger.error({ message: "Error authenticating to Intuit", err });
      });

    callback({
      estimates: createIntuitEstimatesService(client),
    });
  };

  establishConnection();
  setInterval(establishConnection, time);
};

export default createIntuitService;
