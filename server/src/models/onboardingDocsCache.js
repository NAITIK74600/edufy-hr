import mongoose from 'mongoose'
import { Employee } from './Employee.js'

// onboardingDocs can embed multi-MB base64 files, so it is excluded from every query by default
// (select: false) and loaded here, cached per employee until that employee's updatedAt changes.
const cache = new Map()

function stampOf(record) {
  return record.updatedAt ? new Date(record.updatedAt).getTime() : 0
}

export async function attachOnboardingDocs(records) {
  const list = (Array.isArray(records) ? records : [records]).filter((record) => record && mongoose.isValidObjectId(record._id ?? record.id))
  const misses = []
  for (const record of list) {
    const id = String(record._id ?? record.id)
    const stamp = stampOf(record)
    const cached = cache.get(id)
    if (!cached || cached.stamp !== stamp) {
      const entry = { stamp, promise: null }
      cache.set(id, entry)
      misses.push({ id, entry })
    }
  }
  if (misses.length) {
    const batch = Employee.find({ _id: { $in: misses.map(({ id }) => id) } }).select('+onboardingDocs').lean()
      .then((found) => new Map(found.map((employee) => [String(employee._id), employee.onboardingDocs])))
    for (const { id, entry } of misses) {
      entry.promise = batch.then((docs) => docs.get(id))
      entry.promise.catch(() => { if (cache.get(id) === entry) cache.delete(id) })
    }
  }
  await Promise.all(list.map(async (record) => {
    const docs = await cache.get(String(record._id ?? record.id))?.promise
    if (docs !== undefined) record.onboardingDocs = docs
  }))
  return records
}

export function warmOnboardingDocsCache() {
  return Employee.find().select('updatedAt').lean().then(attachOnboardingDocs)
}
