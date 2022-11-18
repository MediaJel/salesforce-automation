import { CompareParams } from "@/utils/types";

export const mustPromise = async <T>(promise: Promise<T>) => {
  try {
    await promise;
  } catch (error) {
    console.error("Application error:", error);
  }
};

export const compare = async <T extends {}>(
  obj: T,
  match: { [key in keyof Partial<T>]: string }
) => {
  return Object.keys(match).some((key) => {
    if (typeof key === "string") {
      const k = match[key] as string;
      return k.includes(match[key]);
    }
    return match[key] === obj[key];
  });
};
