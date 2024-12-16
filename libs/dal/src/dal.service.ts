import mongoose, { Connection, ConnectOptions } from 'mongoose';
import { AuthMechanism } from './types';

export const baseConfig: ConnectOptions = {
  // AUTO_CREATE_INDEXES is deprecated, use MONGO_AUTO_CREATE_INDEXES
  autoIndex: process.env.AUTO_CREATE_INDEXES === 'true' || process.env.MONGO_AUTO_CREATE_INDEXES === 'true',
  maxIdleTimeMS: process.env.MONGO_MAX_IDLE_TIME_IN_MS ? Number(process.env.MONGO_MAX_IDLE_TIME_IN_MS) : 1000 * 30,
  maxPoolSize: process.env.MONGO_MAX_POOL_SIZE ? Number(process.env.MONGO_MAX_POOL_SIZE) : 50,
  minPoolSize: process.env.MONGO_MIN_POOL_SIZE ? Number(process.env.MONGO_MIN_POOL_SIZE) : 10,
  authMechanism: (process.env.MONGO_AUTH_MECHANISM as AuthMechanism) || ('DEFAULT' as AuthMechanism),
};

export class DalService {
  connection: Connection;

  async connect(url: string, config: ConnectOptions = {}) {
    const instance = await mongoose.connect(url, {
      ...baseConfig,
      ...config,
    });

    this.connection = instance.connection;

    return this.connection;
  }

  isConnected(): boolean {
    return this.connection && this.connection.readyState === 1;
  }

  async disconnect() {
    await mongoose.disconnect();
  }

  async destroy() {
    if (process.env.NODE_ENV !== 'test') throw new Error('Allowed only in test mode');

    await mongoose.connection.dropDatabase();
  }
}
