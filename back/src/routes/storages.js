const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storageController');
const { authenticate, requireRole } = require('../middleware/auth');
const storageValidators = require('../utils/validators/storage-validators');
const { ROLES } = require('../utils/constants');


router.use(authenticate);
router.use(requireRole(ROLES.OFFICE_WORKER, ROLES.DIRECTOR, ROLES.STOREKEEPER));


router.get('/', storageController.getAllStorages);
router.get('/:id', storageValidators.validateStorageId, storageController.getStorageById);
router.post('/', storageValidators.validateStorage, storageController.createStorage);
router.put('/:id', storageValidators.validateStorageId, storageValidators.validateStorageUpdate, storageController.updateStorage);
router.delete('/:id', storageValidators.validateStorageId, storageController.deleteStorage);


router.get('/:id/employees', storageValidators.validateStorageId, storageController.getEmployees);
router.post('/:id/employees', storageValidators.validateStorageId, storageValidators.validateAddEmployee, storageController.addEmployee);
router.delete('/:id/employees/:userId', storageValidators.validateRemoveEmployee, storageController.removeEmployee);

module.exports = router;