import { DEFAULT_PHONE } from "@/constants";

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

export const formatPhone = (str: string) => {
  let phone = str.replace(/[-\s]/g, "");

  if (!str.includes("+1")) {
    phone = `+1${phone}`;
  }

  if (phone.length !== 12) {
    return DEFAULT_PHONE;
  }

  return phone;
};

export const isProduction = process.env.NODE_ENV == "production";

export const isStaging = process.env.NODE_ENV == "staging";
