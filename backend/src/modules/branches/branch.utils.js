export const getMainWarehouse = async (db, session) => {
  const main = await db.collection("branches").findOne(
    { isMain: true, status: "active" },
    { session }
  );
    
  if (!main) {
    throw new Error(
      "Main warehouse not configured (isMain: true)"
    );
  }

  return main;
};
