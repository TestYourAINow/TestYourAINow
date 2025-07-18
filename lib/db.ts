import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

// Étendre globalThis pour inclure mongoose cache
declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const globalCache = globalThis as typeof globalThis & {
  mongooseCache?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

if (!globalCache.mongooseCache) {
  globalCache.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (globalCache.mongooseCache!.conn) return globalCache.mongooseCache!.conn;

  if (!globalCache.mongooseCache!.promise) {
    globalCache.mongooseCache!.promise = mongoose.connect(MONGODB_URI, {
      dbName: "testmyai-db",
      bufferCommands: false,
    });
  }

  globalCache.mongooseCache!.conn = await globalCache.mongooseCache!.promise;
  return globalCache.mongooseCache!.conn;
}
