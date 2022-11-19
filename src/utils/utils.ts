export const mustRecover = async <T>(promise: Promise<T>) => {
  try {
    await promise;
  } catch (error) {
    console.error("Application error:", error);
  }
};

export const match = <T extends {}>(
  obj: T,
  where: { [key in keyof Partial<T>]: string }
): boolean => {
  const matched = Object.keys(where).some((key) => {
    return obj[key] === where[key];
  });

  return matched;
};
