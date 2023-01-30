import createLogger from "@/utils/logger";

let state = true;
const logger = createLogger("App State");

const appState = () => {
  return {
    enable() {
      logger.info("App State Enabled");
      state = true;
    },
    disable() {
      logger.warn("App State Disabled");
      state = false;
    },

    state: () => state,
  };
};

export default Object.freeze(appState());
