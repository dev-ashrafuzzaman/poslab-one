export const formatBD = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60000;

  const bdDate = new Date(utcMs + 6 * 60 * 60000);

  const day = String(bdDate.getDate()).padStart(2, "0");
  const month = String(bdDate.getMonth() + 1).padStart(2, "0");
  const year = bdDate.getFullYear();

  let hours = bdDate.getHours();
  const minutes = String(bdDate.getMinutes()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${day}-${month}-${year} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
};