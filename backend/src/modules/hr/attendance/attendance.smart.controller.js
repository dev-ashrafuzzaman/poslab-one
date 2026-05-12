import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../../database/collections.js";
import { calculateAttendance, getDhakaStartOfDay } from "./attendance.utils.js";
import { getDB } from "../../../config/db.js";

export const smartAttendance = async (req, res, next) => {
  try {
    const db = getDB();
    const { employeeId } = req.body;

    /* Employee */
    const employee = await db.collection(COLLECTIONS.EMPLOYEES).findOne({
      _id: new ObjectId(employeeId),
      status: "active",
    });

    if (!employee)
      return res.status(400).json({
        success: false,
        message: "Invalid employee",
      });

    /* Branch */
    const branch = await db.collection(COLLECTIONS.BRANCHES).findOne({
      _id: employee.branchId,
      status: "active",
    });

    if (!branch)
      return res.status(400).json({
        success: false,
        message: "Invalid branch",
      });

    const attendanceCol = db.collection(COLLECTIONS.ATTENDANCES);

    const today = getDhakaStartOfDay();

    const existing = await attendanceCol.findOne({
      employeeId: employee._id,
      date: today,
    });

    /* PUNCH IN */
    if (!existing) {
      const doc = {
        employeeId: employee._id,
        branchId: branch._id,
        date: today,
        punchIn: new Date(),
        status: "present",
        source: "system",

        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await attendanceCol.insertOne(doc);

      return res.json({
        success: true,
        action: "PUNCH_IN",
        message: "Punch in successful",
        data: doc,
      });
    }

    /* PUNCH OUT */
    if (existing && !existing.punchOut) {
      const punchOut = new Date();

      const calc = calculateAttendance({
        punchIn: existing.punchIn,
        punchOut,
      });

      await attendanceCol.updateOne(
        { _id: existing._id },
        {
          $set: {
            punchOut,
            ...calc,
            updatedAt: new Date(),
          },
        }
      );

      return res.json({
        success: true,
        action: "PUNCH_OUT",
        message: "Punch out successful",
        data: calc,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Attendance already completed",
    });
  } catch (err) {
    next(err);
  }
};