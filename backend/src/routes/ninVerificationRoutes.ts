import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

/**
 * @swagger
 * /api/identification/verify-nin:
 *   post:
 *     summary: Verify NIN using external API
 *     tags: [Identification Letters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nin
 *             properties:
 *               nin:
 *                 type: string
 *                 description: National Identification Number
 *     responses:
 *       200:
 *         description: NIN verified successfully
 *       400:
 *         description: Invalid NIN or verification failed
 */
router.post('/verify-nin', async (req: Request, res: Response) => {
  const { nin } = req.body;
  if (!nin || typeof nin !== 'string' || nin.length !== 11) {
    return res.status(400).json({ success: false, message: 'Invalid NIN provided' });
  }

  try {
    // Replace this with actual NIMC or aggregator API endpoint and credentials
    // Example (pseudo):
    // const response = await axios.post('https://api.nimc.gov.ng/verify-nin', { nin }, { headers: { 'Authorization': 'Bearer <API_KEY>' } });
    // For demo, simulate a successful response
    const response = { data: { success: true, details: { name: 'John Doe', dob: '1990-01-01', nin } } };
    if (response.data.success) {
      return res.json({ success: true, details: response.data.details });
    } else {
      return res.status(400).json({ success: false, message: 'NIN verification failed' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'NIN verification service error' });
  }
});

export default router;
