export function getBDToUTCRange(from, to) {
  // BD is UTC+6
  const BD_OFFSET = 6 * 60; // minutes

  const startBD = new Date(from);
  startBD.setHours(0, 0, 0, 0);

  const endBD = new Date(to);
  endBD.setHours(23, 59, 59, 999);

  // Convert BD time to UTC
  const startUTC = new Date(startBD.getTime() - BD_OFFSET * 60000);
  const endUTC = new Date(endBD.getTime() - BD_OFFSET * 60000);

  return { startUTC, endUTC }; 
}
