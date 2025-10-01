// require('elastic-apm-node').start({
//   // Override the service name from package.json
//   // Allowed characters: a-z, A-Z, 0-9, -, _, and space
//   serviceName: 'Reuters-Imagen-live-video-noc-backend',
//   // Use if APM Server requires a secret token
//   secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
//   // Set the custom APM Server URL (default: http://localhost:8200)
//   serverUrl: process.env.ELASTIC_APM_SERVER_URL,
//   // Set the service environment
//   environment: process.env.ELASTIC_APM_ENVIRONMENT,
//   verifyServerCert: false,
//   // logLevel: "debug",
// });

import express, { Express } from 'express';
import config from './Config/index';
import { Logger } from './Util/Logger';
import { initCommonMiddlewares } from './Middleware/CommonMiddleware';

import MongoDbConnection from './Models/index';

const PORT = config.port;
const app: Express = express();
//MongoDbConnection.connect();
initCommonMiddlewares(app).then((parentApp: Express) => {
  parentApp.listen(PORT, () =>
    Logger.info(`Running on ${PORT}`, 'Main.ts->initCommonMiddlewares', PORT)
  );
});
