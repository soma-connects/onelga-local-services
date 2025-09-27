import { Router } from 'express';
import { uploadSingle, uploadFiles } from '../middleware/uploadMiddleware';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/upload/{service}/upload:
 *   post:
 *     summary: Upload a single file to a specified service
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: service
 *         required: true
 *         schema:
 *           type: string
 *         description: The service to which the file is being uploaded (e.g., "identification", "documents").
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload.
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           originalName:
 *                             type: string
 *                           filename:
 *                             type: string
 *                           size:
 *                             type: number
 *                           mimetype:
 *                             type: string
 *                           url:
 *                             type: string
 *                           path:
 *                             type: string
 *       400:
 *         description: Bad request (e.g., no file, file too large, wrong file type)
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:service/upload',
  authenticateToken,
  uploadSingle('file'),
  uploadFiles
);

export default router;
