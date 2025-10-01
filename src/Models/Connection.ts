import mongoose from 'mongoose';
import { Logger } from '../Util/Logger';
import config from '../Config/index';

let database = mongoose.connection;

// Exit on error
mongoose.connection.on('error', (err: any) => {
  Logger.info(`MongoDB connection error: ${err}`, 'mongoose');
  process.exit(-1);
});

const connect = () => {
  if (database.readyState) {
    return;
  }
  mongoose.connect(
    `mongodb://${config.MONGO.USER}:${config.MONGO.PASS}@${config.MONGO.HOST}:${config.MONGO.PORT}/${config.MONGO.DB_NAME}?directConnection=true&authMechanism=DEFAULT&authSource=${config.MONGO.DB_NAME}`
  );
  database = mongoose.connection;
  database.once('open', async () => {
    Logger.info(`[Server] connected to MongoDB`, 'connect');
  });

  database.on('error', (err = {}) => {
    Logger.error(`[Server] error connecting to MongoDB`, 'connect', err);
    process.exit(-1);
  });
};

const disconnect = () => {
  if (!database) {
    return;
  }
  Logger.info(`Disconnected to MongoDB`, 'disconnect');
  mongoose.disconnect();
};

export default {
  database,
  mongoose,
  connect,
  disconnect,
};
