import { Router } from 'express';
import { createReading, getReadingsByStation, getReadingById } from '../controllers/reading.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createReadingSchema } from '../schemas/reading.schema';

const router = Router();

router.use(authMiddleware as any);

/**
 * @swagger
 * /api/readings:
 *   post:
 *     summary: Cria uma nova leitura para uma estação
 *     tags: [Readings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               temperature:
 *                 type: number
 *               humidity:
 *                 type: number
 *               airQuality:
 *                 type: number
 *               stationId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Leitura criada com sucesso
 *       403:
 *         description: Proibido — não é dono da estação
 *       404:
 *         description: Estação não encontrada
 */
router.post('/', validate(createReadingSchema), createReading as any);

/**
 * @swagger
 * /api/readings/station/{stationId}:
 *   get:
 *     summary: Lista leituras de uma estação
 *     tags: [Readings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de leituras
 *       403:
 *         description: Proibido
 *       404:
 *         description: Estação não encontrada
 */
router.get('/station/:stationId', getReadingsByStation as any);

/**
 * @swagger
 * /api/readings/{id}:
 *   get:
 *     summary: Busca uma leitura por ID (com dados da estação)
 *     tags: [Readings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leitura encontrada com dados da estação
 *       403:
 *         description: Proibido
 *       404:
 *         description: Leitura não encontrada
 */
router.get('/:id', getReadingById as any);

export default router;
