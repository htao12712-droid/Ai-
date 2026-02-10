import { Router } from 'express';
import customerController from '../controllers/customerController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', customerController.createCustomer.bind(customerController));
router.post('/batch', customerController.batchImport.bind(customerController));
router.get('/', customerController.getCustomers.bind(customerController));
router.get('/:id', customerController.getCustomerById.bind(customerController));
router.put('/:id', customerController.updateCustomer.bind(customerController));
router.delete('/:id', customerController.softDeleteCustomer.bind(customerController));

export default router;
