const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, requireRole } = require('../middleware/auth');
const orderValidators = require('../utils/validators/order-validators');
const { ROLES } = require('../utils/constants');

router.use(authenticate);

// GET /api/orders
router.get('/', 
    orderValidators.validateOrderFilters,
    orderController.getOrders
);

// GET /api/orders/:id
router.get('/:id', orderValidators.validateOrderId, orderController.getOrderById);

// POST /api/orders
router.post('/', 
    requireRole(ROLES.OFFICE_WORKER, ROLES.DIRECTOR),
    orderValidators.validateCreateOrder,
    orderController.createOrder
);

// POST /api/orders/:id/receive
router.post('/:id/receive', 
    requireRole(ROLES.STOREKEEPER, ROLES.DIRECTOR),
    orderValidators.validateOrderId,
    orderValidators.validateReceiveOrder,
    orderController.receiveOrder
);

// PUT /api/orders/:id
router.put('/:id', 
    requireRole(ROLES.OFFICE_WORKER, ROLES.DIRECTOR),
    orderValidators.validateOrderId,
    orderValidators.validateUpdateOrder,
    orderController.updateOrder
);

// DELETE /api/orders/:id
router.delete('/:id', 
    requireRole(ROLES.OFFICE_WORKER, ROLES.DIRECTOR),
    orderValidators.validateOrderId,
    orderController.deleteOrder
);

module.exports = router;