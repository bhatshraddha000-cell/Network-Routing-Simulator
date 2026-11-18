import express from 'express';
import { calculateDijkstra } from '../controllers/algorithmController.js';

const router = express.Router();

router.post('/dijkstra', calculateDijkstra);

export default router;

