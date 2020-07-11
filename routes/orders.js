const express = require('express');
const router = express.Router();
const ordersControleler = require('../controllers/ordersController');


router.get('/', ordersControleler.getOrders );

router.get('/:orderId', ordersControleler.getOrder );

router.post('/', ordersControleler.postOrder );

router.delete('/:orderId', ordersControleler.deleteOrder );


module.exports = router 