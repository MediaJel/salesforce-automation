export const mustPromise = async <T>(promise: Promise<T>) => {
  try {
    await promise;
  } catch (error) {
    console.error("Application error:", error);
  }
};

export const match = <T extends {}>(
  obj: T,
  criteria: { [key in keyof Partial<T>]: string }
): boolean => {
  return Object.keys(obj).some((key) => {
    if (typeof key === "string") {
      const k = obj[key] as string;
      return k.includes(criteria[key]);
    }
    return obj[key] === criteria[key];
  });
};
