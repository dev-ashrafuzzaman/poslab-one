import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../database/collections.js";

export const createCustomer = async ({ db, payload }) => {
  const customer = {
    ...payload,
    loyaltyPoints: 0,
    dueBalance: payload.openingDue || 0,
    advanceBalance: payload.openingAdvance || 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await db
    .collection(COLLECTIONS.CUSTOMERS)
    .insertOne(customer);

  return { ...customer, _id: result.insertedId };
};

export const getCustomerById = async ({ db, id }) => {
  return db.collection(COLLECTIONS.CUSTOMERS).findOne({
    _id: new ObjectId(id)
  });
};

export const updateCustomer = async ({ db, id, payload }) => {
  await db.collection(COLLECTIONS.CUSTOMERS).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...payload,
        updatedAt: new Date()
      }
    }
  );
};

export const adjustCustomerBalance = async ({
  db,
  customerId,
  dueChange = 0,
  advanceChange = 0
}) => {
  await db.collection(COLLECTIONS.CUSTOMERS).updateOne(
    { _id: new ObjectId(customerId) },
    {
      $inc: {
        dueBalance: dueChange,
        advanceBalance: advanceChange
      }
    }
  );
};
