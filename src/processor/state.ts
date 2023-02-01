import createLogger from "@/utils/logger";

let state = true;
const logger = createLogger("Processor State");

const appState = () => {
  return {
    enable() {
      logger.info("Processor State Enabled");
      state = true;
    },
    disable() {
      logger.warn("Processor State Disabled");
      state = false;
    },

    state: () => state,
  };
};

export default Object.freeze(appState());
