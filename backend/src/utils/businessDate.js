// utils/businessDate.js
export const getBusinessDateBD = () => {
  const now = new Date();

  // Bangladesh = UTC +6
  const bdTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" })
  );

  bdTime.setHours(0, 0, 0, 0);
  return bdTime;
};
