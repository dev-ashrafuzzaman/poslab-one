import { getDB } from "../config/db.js"


export default async function withTransaction(callback) {
  const db = getDB()
  const session = db.client.startSession()

  try {
    let result
    await session.withTransaction(async () => {
      result = await callback(session)
    })
    return result
  } finally {
    await session.endSession()
  }
}
