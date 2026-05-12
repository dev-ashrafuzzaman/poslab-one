import { ObjectId } from "mongodb";

/**
 * Build reusable aggregation pipeline for list pages
 */
export const buildAggregationPipeline = ({
  match = {},
  search,
  searchableFields = [],
  lookups = [],
  project = {},
  sort = { createdAt: -1 },
  page = 1,
  limit = 10,
}) => {
  const pipeline = [];

  /* --------------------
     MATCH + SEARCH
  --------------------- */
  const finalMatch = { ...match };

  if (search && searchableFields.length) {
    finalMatch.$or = searchableFields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    }));
  }

  pipeline.push({ $match: finalMatch });

  /* --------------------
     LOOKUPS
  --------------------- */
  for (const lookup of lookups) {
    pipeline.push({
      $lookup: {
        from: lookup.from,
        localField: lookup.localField,
        foreignField: lookup.foreignField,
        as: lookup.as,
      },
    });

    if (lookup.unwind !== false) {
      pipeline.push({
        $unwind: {
          path: `$${lookup.as}`,
          preserveNullAndEmptyArrays: lookup.preserveNull ?? false,
        },
      });
    }
  }

  /* --------------------
     SORT
  --------------------- */
  pipeline.push({ $sort: sort });

  /* --------------------
     PAGINATION
  --------------------- */
  pipeline.push({ $skip: (page - 1) * limit });
  pipeline.push({ $limit: limit });

  /* --------------------
     PROJECT
  --------------------- */
  if (Object.keys(project).length) {
    pipeline.push({ $project: project });
  }

  return pipeline;
};

/* --------------------
   Helper: ObjectId cast
--------------------- */
export const castObjectId = (value) =>
  /^[0-9a-fA-F]{24}$/.test(value)
    ? new ObjectId(value)
    : value;
