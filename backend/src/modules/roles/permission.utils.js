// permission.utils.js
export const flattenPermissions = (obj) => {
  let result = [];

  for (const key in obj) {
    if (typeof obj[key] === "string") {
      result.push(obj[key]);
    } else if (typeof obj[key] === "object") {
      result = result.concat(flattenPermissions(obj[key]));
    }
  }

  return result;
};
