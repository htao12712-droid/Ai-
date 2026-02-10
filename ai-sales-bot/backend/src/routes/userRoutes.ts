import { Router } from 'express';
import userController from '../controllers/userController';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.post('/register', userController.register.bind(userController));
router.post('/login', userController.login.bind(userController));
router.get('/users', authMiddleware, requireRole(['admin']), userController.getUsers.bind(userController));
router.get('/users/:id', authMiddleware, userController.getUserById.bind(userController));
router.put('/users/:id/permissions', authMiddleware, requireRole(['admin']), userController.updateUserPermissions.bind(userController));
router.get('/me', authMiddleware, userController.getMe.bind(userController));

export default router;
