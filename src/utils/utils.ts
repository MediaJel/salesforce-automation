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

/**
 * Removes whitespace from a string and converts it to lowercase
 *
 * @param str string
 * @returns string
 */
export const format = (str: string) => str.replace(/\s/g, "").toLowerCase();

export const isProduction = process.env.NODE_ENV === "production";
