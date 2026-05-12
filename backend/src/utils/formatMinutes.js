export const formatTime12 = (date) => {
  if (!date) return null;

  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Dhaka",
  });
};

export const formatDate = (date) => {
  if (!date) return null;

  return new Date(date).toLocaleDateString("en-GB", {
    timeZone: "Asia/Dhaka",
  });
};

export const formatWorkingTime = (minutes = 0) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return `${h}h ${m}m`;
};