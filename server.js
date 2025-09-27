// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';
import carteleraRouter from './routes/cartelera.routes.js';
import { getPool } from './config/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Ver el JSON de la especificación (depuración Swagger)
app.get('/docs-json', (_req, res) => res.json(swaggerSpec));


// Rutas
app.use('/api/cartelera', carteleraRouter);

// Healthcheck + prueba DB
app.get('/health', async (_req, res) => {
  try {
    const pool = await getPool();
    const { recordset } = await pool.request().query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: recordset[0].ok === 1 });
  } catch {
    res.status(500).json({ status: 'error', db: false });
  }
});

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
  console.log(`Swagger UI:       http://localhost:${PORT}/docs`);
});
