export const aggregateList = async ({
  db,
  collection,
  pipeline,
  match = {},
}) => {
  const [data, total] = await Promise.all([
    db.collection(collection).aggregate(pipeline).toArray(),
    db.collection(collection).countDocuments(match),
  ]);

  return { data, total };
};
