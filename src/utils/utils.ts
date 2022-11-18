export const mustPromise = async <T>(promise: Promise<T>) => {
  try {
    await promise;
  } catch (error) {
    console.error("Application error:", error);
  }
};
