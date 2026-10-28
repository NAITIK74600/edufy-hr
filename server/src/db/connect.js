import mongoose from 'mongoose'

export async function connectDatabase(uri = process.env.MONGODB_URI) {
  if (!uri) return false
  const maxPoolSize = Number(process.env.MONGO_POOL_SIZE) || 200
  const minPoolSize = Number(process.env.MONGO_MIN_POOL_SIZE) || 20
  const options = {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize,
    minPoolSize,
    maxIdleTimeMS: 30000,
    socketTimeoutMS: 45000,
  }
  try {
    await mongoose.connect(uri, options)
    return true
  } catch (error) {
    if ((uri.includes('127.0.0.1') || uri.includes('localhost')) && uri.includes('@')) {
      const candidates = [
        'mongodb://127.0.0.1:27017/edufyi_hr',
        uri.replace(/\/\/[^@]+@/, '//').split('?')[0],
      ]
      for (const fallback of candidates) {
        try {
          await mongoose.connect(fallback, options)
          console.log(`[DB] Connected to local MongoDB via fallback (${fallback})`)
          return true
        } catch {}
      }
    }
    throw error
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
}
