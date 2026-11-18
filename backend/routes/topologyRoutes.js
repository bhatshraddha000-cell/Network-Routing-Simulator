import express from 'express';
import {
  getCurrentTopology,
  saveCurrentTopology,
  resetCurrentTopology,
  loadExampleTopology,
} from '../controllers/topologyController.js';

const router = express.Router();

router.get('/current', getCurrentTopology);
router.put('/current', saveCurrentTopology);
router.post('/current/reset', resetCurrentTopology);
router.post('/example', loadExampleTopology);

export default router;

