import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesGlob = path.join(__dirname, '../routes/*.js').replace(/\\/g, '/');

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API Cartelera',
      version: '1.0.0',
      description: 'API Odalis – Express, mssql, .env y Swagger'
    },

    servers: [
      { url: '/', description: 'Current host' }
    ]

  },
  apis: [routesGlob]
});
