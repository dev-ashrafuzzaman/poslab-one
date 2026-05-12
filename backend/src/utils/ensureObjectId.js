import { ObjectId } from "mongodb";

export const ensureObjectId = (id, field = "id") => {
  if (id instanceof ObjectId) return id;
  if (ObjectId.isValid(id)) return new ObjectId(id);
  throw new Error(`${field} must be a valid ObjectId`);
};
