export const getDhakaStartOfDay = () => {
  const now = new Date();

  const dhaka = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" })
  );

  dhaka.setHours(0, 0, 0, 0);

  return dhaka;
};

export const calculateAttendance = ({
  punchIn,
  punchOut,
  officeStartHour = 10,
}) => {
  const start = new Date(punchIn);
  const end = new Date(punchOut);

  /* Working minutes */
  const workingMinutes = Math.max(
    Math.floor((end - start) / 60000),
    0
  );

  /* Office start */
  const officeStart = new Date(start);
  officeStart.setHours(officeStartHour, 0, 0, 0);

  /* Late calculation */
  let lateMinutes = 0;

  if (start > officeStart) {
    lateMinutes = Math.floor((start - officeStart) / 60000);
  }

  /* Status */
  let status = "present";

  if (lateMinutes > 0) status = "late";

  if (workingMinutes < 30) status = "invalid";

  return {
    workingMinutes,
    lateMinutes,
    status,
  };
};