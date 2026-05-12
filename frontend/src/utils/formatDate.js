export const formatShortDate = (date) => {
  if (!date) return "-";

  const d = new Date(date);

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
};


export const formatBDDateTime = (isoDate) => {
  if (!isoDate) return "";

  const date = new Date(isoDate);

  return date.toLocaleString("en-US", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};