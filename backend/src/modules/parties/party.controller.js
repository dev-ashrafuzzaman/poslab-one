import { getDB } from "../../config/db.js";
import { createParty, updateParty } from "./party.service.js";

export const createPartyController = async (req, res, next) => {
  try {
    const party = await createParty({
      db: getDB(),
      payload: req.body,
      user: req.user,
    });

    res.status(201).json({
      success: true,
      message: `${party.type} created successfully`,
      data: party,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePartyController = async (req, res, next) => {
  try {
    const party = await updateParty({
      db: getDB(),
      payload: req.body,
      user: req.user,
      partyId: req.params.id,
    });

    res.status(200).json({
      success: true,
      message: "Party updated successfully",
      data: party,
    });
  } catch (err) {
    next(err);
  }
};
