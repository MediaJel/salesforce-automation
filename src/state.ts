import createLogger from "@/utils/logger";

const observers = [];
let state = true;

const logger = createLogger("App State");

const appState = () => {
  return {
    enable() {
      logger.info("App is enabled");
      state = true;
      observers.forEach((observer) => observer(state));
    },
    disable() {
      logger.warn("App is disabled");
      state = false;
      observers.forEach((observer) => observer(state));
    },
    subscribe: (cb: (state: boolean) => void) => {
      observers.push(cb);
    },
  };
};

export default Object.freeze(appState());
