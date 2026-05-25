import { Router } from 'express';
import { createStation, getStations, getStationById, getAllStations, updateStation, deleteStation } from '../controllers/station.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createStationSchema, updateStationSchema } from '../schemas/station.schema.js';

const router = Router();

router.use(authMiddleware as any);

/**
 * @swagger
 * /api/stations:
 *   post:
 *     summary: Cria uma nova estação meteorológica
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Estação criada com sucesso
 */
router.post('/', validate(createStationSchema), createStation as any);

/**
 * @swagger
 * /api/stations:
 *   get:
 *     summary: Lista as estações do usuário autenticado
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estações
 */
router.get('/', getStations as any);

/**
 * @swagger
 * /api/stations/all:
 *   get:
 *     summary: Lista todas as estações (apenas ADMIN)
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas as estações
 *       403:
 *         description: Acesso negado
 */
router.get('/all', authorize('ADMIN') as any, getAllStations as any);

/**
 * @swagger
 * /api/stations/{id}:
 *   get:
 *     summary: Busca uma estação por ID (com leituras incluídas)
 *     tags: [Stations]
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
 *         description: Estação encontrada com leituras
 *       404:
 *         description: Estação não encontrada
 */
router.get('/:id', getStationById as any);

/**
 * @swagger
 * /api/stations/{id}:
 *   put:
 *     summary: Atualiza uma estação (apenas o dono)
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Estação atualizada
 *       403:
 *         description: Proibido — não é o dono
 *       404:
 *         description: Estação não encontrada
 */
router.put('/:id', validate(updateStationSchema), updateStation as any);

/**
 * @swagger
 * /api/stations/{id}:
 *   delete:
 *     summary: Deleta uma estação (apenas o dono)
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Estação deletada
 *       403:
 *         description: Proibido — não é o dono
 *       404:
 *         description: Estação não encontrada
 */
router.delete('/:id', deleteStation as any);

export default router;
