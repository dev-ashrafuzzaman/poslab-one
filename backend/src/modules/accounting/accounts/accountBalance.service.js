import { ObjectId } from "mongodb"
import { getDB } from "../../../config/db.js"

export const getAccountBalance = async ({ accountId, branchId }) => {

  const db = getDB()

  const result = await db.collection("ledgers").aggregate([
    {
      $match:{
        accountId:new ObjectId(accountId),
        branchId:new ObjectId(branchId)
      }
    },
    {
      $group:{
        _id:null,
        debit:{ $sum:"$debit"},
        credit:{ $sum:"$credit"}
      }
    }
  ]).toArray()

  if(!result.length) return 0

  return result[0].debit - result[0].credit

}