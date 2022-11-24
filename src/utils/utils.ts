export const tryCatch = async <T>(fn: () => Promise<T>) => {
  try {
    await fn();
  } catch (err) {
    console.error("Application error: ");
    console.error(err);
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

export const isProduction = process.env.NODE_ENV === "production";
