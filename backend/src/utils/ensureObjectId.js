import { ObjectId } from "mongodb";

export const ensureObjectId = ({ value, field = "id", required = true }) => {
  if (!value) {
    if (!required) return null;

    throw new Error(`${field} is required`);
  }

  if (value instanceof ObjectId) {
    return value;
  }

  if (!ObjectId.isValid(value)) {
    throw new Error(`${field} must be a valid ObjectId`);
  }

  return new ObjectId(value);
};
