import { COLLECTIONS } from "../../database/collections.js";

export const getSetting = async (db, key) => {
  return db.collection(COLLECTIONS.SETTINGS).findOne({ key });
};


export const calculatePoints = ({ amount, rule }) => {
  const rawPoints = (amount / rule.spendAmount) * rule.earnPoints;

  switch (rule.round) {
    case "CEIL":
      return Math.ceil(rawPoints);
    case "ROUND":
      return Math.round(rawPoints);
    default:
      return Math.floor(rawPoints);
  }
};
