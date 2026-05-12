import { formatBD } from "./date.js";

export const formatDocuments = (data, dateFields = ["createdAt", "updatedAt"]) => {
  if (!data) return data;

  return data.map((doc) => {
    const formatted = { ...doc };

    dateFields.forEach((field) => {
      if (formatted[field]) {
        formatted[field] = formatBD(formatted[field]);
      }
    });

    return formatted;
  });
};