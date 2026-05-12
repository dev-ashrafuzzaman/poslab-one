import { ObjectId } from "mongodb";
import { writeAuditLog } from "../utils/logger.js";
import { formatDocuments } from "../utils/formatedDocument.js";
import { getDB } from "../config/db.js";

export const createOne = ({ collection, schema }) => {
  return async (req, res, next) => {
    try {
      const db = getDB();
      const { error, value } = schema.validate(req.body);
      if (error) throw error;

      const doc = {
        ...value,
        ...(req.generated || {}),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection(collection).insertOne(doc);

      await writeAuditLog({
        db,
        userId: req.user?._id,
        action: "CREATE",
        collection,
        documentId: result.insertedId,
        payload: doc,
      });

      res.status(201).json({
        success: true,
        data: { _id: result.insertedId },
      });
    } catch (err) {
      next(err);
    }
  };
};

export const createOneTx =
  ({ collection, schema }) =>
  async (req, res, next) => {
    const db = getDB();
    const session = req.session;

    try {
      /* =====================
         JOI VALIDATION
      ====================== */
      if (schema) {
        const { error, value } = schema.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          return res.status(422).json({
            success: false,
            message: "Validation failed",
            errors: error.details.map(d => d.message),
          });
        }

        req.body = value; 
      }

      /* =====================
         TRANSACTION
      ====================== */
      await session.withTransaction(async () => {
        const payload = {
          ...req.body,
          ...req.generated,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db
          .collection(collection)
          .insertOne(payload, { session });
      });

      res.status(201).json({
        success: true,
        message: "created successfully",
      });
    } catch (err) {
      await session.abortTransaction();
      next(err);
    } finally {
      await session.endSession();
    }
  };

export const getAll = ({
  collection,
  searchableFields = [],
  filterableFields = [],
  projection = {},
  dateFields = ["createdAt", "updatedAt"],
}) => {
  return async (req, res, next) => {
    try {
      const db = getDB();

      /* =====================================================
         1️⃣ Pagination
      ===================================================== */
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const limit = Math.min(parseInt(req.query.limit) || 10, 100);
      const skip = (page - 1) * limit;

      /* =====================================================
         2️⃣ Sorting
      ===================================================== */
      const sortField = req.query.sortBy || "createdAt";
      const sortOrder = req.query.sort === "asc" ? 1 : -1;

      /* =====================================================
         3️⃣ Smart Value Casting
      ===================================================== */
      const castSingleValue = (value) => {
        if (value === "true") return true;
        if (value === "false") return false;

        // Number
        if (!isNaN(value) && value.trim() !== "") return Number(value);

        // ObjectId
        if (/^[0-9a-fA-F]{24}$/.test(value))
          return new ObjectId(value);

        return value;
      };

      const castValue = (value) => {
        // Comma separated → $in
        if (value.includes(",")) {
          return {
            $in: value.split(",").map((v) => castSingleValue(v.trim())),
          };
        }
        return castSingleValue(value);
      };

      /* =====================================================
         4️⃣ Filtering
      ===================================================== */
      const filter = {};

      filterableFields.forEach((field) => {
        if (req.query[field] !== undefined) {
          filter[field] = castValue(req.query[field]);
        }
      });

      /* =====================================================
         5️⃣ Global Search
      ===================================================== */
      if (req.query.search && searchableFields.length) {
        filter.$or = searchableFields.map((field) => ({
          [field]: {
            $regex: req.query.search,
            $options: "i",
          },
        }));
      }

      /* =====================================================
         6️⃣ Query Execute
      ===================================================== */
      const cursor = db
        .collection(collection)
        .find(filter)
        .project(projection)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit);

      const data = await cursor.toArray();
      const total = await db.collection(collection).countDocuments(filter);

      res.json({
        success: true,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + data.length < total,
        },
        data: formatDocuments(data, dateFields),
      });
    } catch (err) {
      next(err);
    }
  };
};

export const getAllSmart = ({
  collection,
  searchableFields = [],
  filterableFields = [],
  projection = {},
}) => {
  return async (req, res, next) => {
    try {
      const db = getDB();

      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Number(req.query.limit) || 20, 50);
      const skip = (page - 1) * limit;

      const search = req.query.search?.trim();
      const filter = {};

      /* ---------- Filters ---------- */
      filterableFields.forEach((f) => {
        if (req.query[f] !== undefined) {
          filter[f] = req.query[f];
        }
      });

      const pipeline = [];

      /* ---------- Search (Indexed) ---------- */
      if (search) {
        pipeline.push({
          $match: {
            ...filter,
            $or: [{ code: search }, { phone: search }],
          },
        });

        pipeline.push({
          $addFields: {
            _rank: {
              $cond: [
                { $eq: ["$code", search] },
                1,
                {
                  $cond: [{ $eq: ["$phone", search] }, 2, 99],
                },
              ],
            },
          },
        });

        pipeline.push({
          $unionWith: {
            coll: collection,
            pipeline: [
              {
                $match: {
                  ...filter,
                  $text: { $search: search },
                },
              },
              {
                $addFields: {
                  _rank: { $literal: 3 },
                  _score: { $meta: "textScore" },
                },
              },
            ],
          },
        });

        pipeline.push({
          $sort: {
            _rank: 1,
            _score: -1,
            name: 1,
          },
        });
      } else {
        pipeline.push({ $match: filter });
        pipeline.push({ $sort: { createdAt: -1 } });
      }

      /* ---------- Count ---------- */
      const countPipeline = [...pipeline, { $count: "total" }];
      const countRes = await db
        .collection(collection)
        .aggregate(countPipeline)
        .toArray();

      const total = countRes[0]?.total || 0;

      /* ---------- Pagination ---------- */
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      /* ---------- Projection ---------- */
      pipeline.push({
        $project: {
          _score: 0,
          ...projection,
        },
      });

      const data = await db
        .collection(collection)
        .aggregate(pipeline)
        .toArray();

      res.json({
        success: true,
        pagination: {
          page,
          limit,
          total,
          hasMore: skip + data.length < total,
        },
        data,
      });
    } catch (err) {
      next(err);
    }
  };
};

export const getOneById = ({ collection, projection = {} }) => {
  return async (req, res, next) => {
    try {
      const db = getDB();
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      const data = await db
        .collection(collection)
        .findOne({ _id: new ObjectId(id) }, { projection });

      if (!data) {
        return res.status(404).json({ success: false, message: "Not found" });
      }

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
};

export const updateOne = ({ collection, schema }) => {
  return async (req, res, next) => {
    try {
      const db = getDB();;
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      const { error, value } = schema.validate(req.body);
      if (error) throw error;

      const result = await db.collection(collection).updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...value,
            updatedAt: new Date(),
          },
        },
      );

      if (!result.matchedCount) {
        return res.status(404).json({ success: false, message: "Not found" });
      }

      await writeAuditLog({
        db,
        userId: req.user?._id,
        action: "UPDATE",
        collection,
        documentId: id,
        payload: value,
      });

      res.json({ success: true, message: "Updated successfully" });
    } catch (err) {
      next(err);
    }
  };
};

export const toggleStatus = ({ collection }) => {
  return async (req, res, next) => {
    try {
      const db =getDB();
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID",
        });
      }

      // 1️⃣ Find current document
      const doc = await db.collection(collection).findOne({
        _id: new ObjectId(id),
      });

      if (!doc) {
        return res.status(404).json({
          success: false,
          message: "Not found",
        });
      }

      // 2️⃣ Toggle status
      const currentStatus = (doc.status || "inactive").toLowerCase();
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      // 3️⃣ Update DB
      await db.collection(collection).updateOne(
        { _id: doc._id },
        {
          $set: {
            status: newStatus,
            updatedAt: new Date(),
          },
        },
      );

      // 4️⃣ Audit log
      await writeAuditLog({
        db,
        userId: req.user?._id,
        action: "STATUS_CHANGE",
        collection,
        documentId: id,
        payload: {
          from: currentStatus ? "ACTIVE" : "INACTIVE",
          to: newStatus ? "ACTIVE" : "INACTIVE",
        },
      });

      // 5️⃣ Response
      res.json({
        success: true,
        message: `Status changed to ${newStatus ? "Active" : "Inactive"}`,
        data: {
          id,
          status: newStatus,
        },
      });
    } catch (err) {
      next(err);
    }
  };
};

export const deleteOne = ({ collection }) => {
  return async (req, res, next) => {
    try {
      const db = getDB();
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      const result = await db.collection(collection).deleteOne({
        _id: new ObjectId(id),
      });

      if (!result.deletedCount) {
        return res.status(404).json({ success: false, message: "Not found" });
      }

      await writeAuditLog({
        db,
        userId: req.user?._id,
        action: "DELETE",
        collection,
        documentId: id,
      });

      res.json({ success: true, message: "Deleted successfully" });
    } catch (err) {
      next(err);
    }
  };
};
