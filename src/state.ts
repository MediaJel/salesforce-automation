import createLogger from "@/utils/logger";

const observers = [];
let state = true;

const logger = createLogger("App State");

const appState = () => {
  return {
    enable() {
      logger.info("App State enabled");
      state = true;
      observers.forEach((observer) => observer(state));
    },
    disable() {
      logger.warn("App State disabled");
      state = false;
      observers.forEach((observer) => observer(state));
    },
    subscribe: (cb: (state: boolean) => void) => {
      observers.push(cb);
    },
    state: () => state,
  };
};

export default Object.freeze(appState());
