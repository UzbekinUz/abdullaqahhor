import mongoose from 'mongoose';
import path from 'node:path';
import fs from 'node:fs';
import { ROOT } from './paths.js';

// MONGODB_URI bo'sh bo'lsa, loyiha ichidagi lokal MongoDB (server/data) ishga tushiriladi.
export async function connectDb() {
  let uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const dbPath = path.join(ROOT, 'data');
    fs.mkdirSync(dbPath, { recursive: true });
    const mongod = await MongoMemoryServer.create({
      instance: { dbPath, storageEngine: 'wiredTiger', port: 27018 },
    });
    uri = mongod.getUri('abdulla_qahhor');
    console.log('Lokal MongoDB ishga tushdi:', uri);
    const stop = async () => { await mongod.stop(); process.exit(0); };
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
  }
  await mongoose.connect(uri);
}
