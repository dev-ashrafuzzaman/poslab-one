import { ObjectId } from "mongodb";

export const toObjectId = (value, fieldName = "id") => {
  if (value === null || value === undefined || value === "") return null;
  if (!ObjectId.isValid(value)) throw new Error(`Invalid ${fieldName}`);
  return new ObjectId(value);
};
