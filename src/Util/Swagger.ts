// swagger.ts

const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'A simple Express API',
    },
    servers: [
      {
        url: 'http://localhost:8089',
      },
    ],
  },
  apis: ['./src/Routes/*.ts', './src/Routes/*.js'], // where your endpoints are defined
};

const swaggerSpec = swaggerJsDoc(options);

export default swaggerSpec;
