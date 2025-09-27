// routes/cartelera.routes.js
import { Router } from 'express';
import { body, param } from 'express-validator';
import { getPool, sql } from '../config/db.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cartelera
 *   description: Endpoints para la tabla dbo.Cartelera7585
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CarteleraItem:
 *       type: object
 *       required: [imdbID, Title, Year, Type, Estado, Description, Ubication]
 *       properties:
 *         Id:
 *           type: integer
 *           description: Autoincremental
 *         imdbID:
 *           type: integer
 *           example: 80000
 *         Title:
 *           type: string
 *           example: Titanes del Atlantico
 *         Year:
 *           type: string
 *           description: Año en 4 dígitos
 *           example: "2013"
 *         Type:
 *           type: string
 *           example: Ciencia Ficcion
 *         Poster:
 *           type: string
 *           example: https://demo/demoimages.png
 *         Estado:
 *           type: boolean
 *           example: true
 *         Description:
 *           type: string
 *           example: La humanidad se transforma en robots gigantes para defender la costa...
 *         Ubication:
 *           type: string
 *           example: POPCINEMA
 */

/**
 * @swagger
 * /api/cartelera:
 *   get:
 *     summary: Listar cartelera
 *     tags: [Cartelera]
 *     responses:
 *       200:
 *         description: Devuelve la lista de items de cartelera
 */
router.get('/', async (_req, res) => {
  try {
    const pool = await getPool();
    const { recordset } = await pool.request().query(`
      SELECT Id, imdbID, Title, [Year], [Type], Poster, Estado, [Description], Ubication
      FROM dbo.Cartelera7585
      ORDER BY Id DESC
    `);
    res.json({ ok: true, message: 'Consulta realizada correctamente', data: recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error listando cartelera' });
  }
});

/**
 * @swagger
 * /api/cartelera/{id}:
 *   get:
 *     summary: Obtener un item por Id
 *     tags: [Cartelera]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Devuelve el item solicitado
 *       404:
 *         description: No encontrado
 */
router.get('/:id',
  param('id').isInt(),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const pool = await getPool();
      const { recordset } = await pool.request()
        .input('Id', sql.Int, id)
        .query(`
          SELECT Id, imdbID, Title, [Year], [Type], Poster, Estado, [Description], Ubication
          FROM dbo.Cartelera7585
          WHERE Id = @Id
        `);
      if (recordset.length === 0) return res.status(404).json({ ok: false, message: 'No encontrado' });
      res.json({ ok: true, message: 'Consulta realizada correctamente', data: recordset[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, message: 'Error obteniendo item' });
    }
  }
);

/**
 * @swagger
 * /api/cartelera:
 *   post:
 *     summary: Insertar un nuevo item en cartelera
 *     tags: [Cartelera]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CarteleraItem'
 *           example:
 *             imdbID: 80000
 *             Title: "Titanes del Atlantico"
 *             Year: "2013"
 *             Type: "Ciencia Ficcion"
 *             Poster: "https://demo/demoimages.png"
 *             Estado: true
 *             Description: "La humanidad se transforma en robots gigantes para defender la costa..."
 *             Ubication: "POPCINEMA"
 *     responses:
 *       201:
 *         description: Insertado correctamente
 */
router.post('/',
  body('imdbID').isInt(),
  body('Title').isString().notEmpty(),
  body('Year').isString().isLength({ min: 4, max: 4 }),
  body('Type').isString().notEmpty(),
  body('Poster').optional().isString(),
  body('Estado').isBoolean(),
  body('Description').isString().notEmpty(),
  body('Ubication').isString().notEmpty(),
  async (req, res) => {
    try {
      const { imdbID, Title, Year, Type, Poster, Estado, Description, Ubication } = req.body;
      const pool = await getPool();
      const result = await pool.request()
        .input('imdbID', sql.Int, imdbID)
        .input('Title', sql.NVarChar(200), Title)
        .input('Year', sql.Char(4), Year)
        .input('Type', sql.NVarChar(50), Type)
        .input('Poster', sql.NVarChar(500), Poster ?? null)
        .input('Estado', sql.Bit, Estado ? 1 : 0)
        .input('Description', sql.NVarChar(sql.MAX), Description)
        .input('Ubication', sql.NVarChar(100), Ubication)
        .query(`
          INSERT INTO dbo.Cartelera7585
            (imdbID, Title, [Year], [Type], Poster, Estado, [Description], Ubication)
          OUTPUT INSERTED.*
          VALUES (@imdbID, @Title, @Year, @Type, @Poster, @Estado, @Description, @Ubication)
        `);

      res.status(201).json({ ok: true, message: 'Insertado correctamente', data: result.recordset[0] });
    } catch (err) {
      console.error(err);
      const dup = err?.number === 2627 || err?.number === 2601; // UNIQUE/PK
      res.status(400).json({ ok: false, message: dup ? 'imdbID ya existe' : 'Error insertando item' });
    }
  }
);

/**
 * @swagger
 * /api/cartelera/{id}:
 *   put:
 *     summary: Actualizar un item de cartelera
 *     tags: [Cartelera]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CarteleraItem'
 *           example:
 *             Title: "Titanes del Atlantico (Edición Extendida)"
 *             Poster: "https://demo/newposter.png"
 *     responses:
 *       200:
 *         description: Actualizado correctamente
 *       404:
 *         description: No encontrado
 */
router.put('/:id',
  param('id').isInt(),
  body('imdbID').optional().isInt(),
  body('Title').optional().isString().notEmpty(),
  body('Year').optional().isString().isLength({ min: 4, max: 4 }),
  body('Type').optional().isString().notEmpty(),
  body('Poster').optional().isString(),
  body('Estado').optional().isBoolean(),
  body('Description').optional().isString().notEmpty(),
  body('Ubication').optional().isString().notEmpty(),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { imdbID, Title, Year, Type, Poster, Estado, Description, Ubication } = req.body;

      const sets = [];
      const pool = await getPool();
      const request = pool.request().input('Id', sql.Int, id);

      if (imdbID !== undefined) { sets.push('imdbID = @imdbID'); request.input('imdbID', sql.Int, imdbID); }
      if (Title  !== undefined) { sets.push('Title = @Title'); request.input('Title', sql.NVarChar(200), Title); }
      if (Year   !== undefined) { sets.push('[Year] = @Year'); request.input('Year', sql.Char(4), Year); }
      if (Type   !== undefined) { sets.push('[Type] = @Type'); request.input('Type', sql.NVarChar(50), Type); }
      if (Poster !== undefined) { sets.push('Poster = @Poster'); request.input('Poster', sql.NVarChar(500), Poster ?? null); }
      if (Estado !== undefined) { sets.push('Estado = @Estado'); request.input('Estado', sql.Bit, Estado ? 1 : 0); }
      if (Description !== undefined) { sets.push('[Description] = @Description'); request.input('Description', sql.NVarChar(sql.MAX), Description); }
      if (Ubication   !== undefined) { sets.push('Ubication = @Ubication'); request.input('Ubication', sql.NVarChar(100), Ubication); }

      if (sets.length === 0) return res.status(400).json({ ok: false, message: 'Nada para actualizar' });

      const { rowsAffected } = await request.query(`
        UPDATE dbo.Cartelera7585
        SET ${sets.join(', ')}
        WHERE Id = @Id
      `);
      if (rowsAffected[0] === 0) return res.status(404).json({ ok: false, message: 'No encontrado' });

      const { recordset } = await pool.request()
        .input('Id', sql.Int, id)
        .query(`
          SELECT Id, imdbID, Title, [Year], [Type], Poster, Estado, [Description], Ubication
          FROM dbo.Cartelera7585
          WHERE Id = @Id
        `);

      res.json({ ok: true, message: 'Actualizado correctamente', data: recordset[0] });
    } catch (err) {
      console.error(err);
      const dup = err?.number === 2627 || err?.number === 2601;
      res.status(400).json({ ok: false, message: dup ? 'imdbID ya existe' : 'Error actualizando item' });
    }
  }
);

export default router;
