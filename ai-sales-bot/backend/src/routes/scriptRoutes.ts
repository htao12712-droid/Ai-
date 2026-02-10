import { Router } from 'express';
import scriptController from '../controllers/scriptController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', scriptController.createScript.bind(scriptController));
router.get('/', scriptController.getScripts.bind(scriptController));
router.get('/:id', scriptController.getScriptById.bind(scriptController));
router.put('/:id', scriptController.updateScript.bind(scriptController));
router.delete('/:id', scriptController.deleteScript.bind(scriptController));
router.post('/preview', scriptController.previewScript.bind(scriptController));
router.get('/:id/versions', scriptController.getScriptVersions.bind(scriptController));

export default router;
