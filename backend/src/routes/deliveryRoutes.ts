import { Router } from 'express'
import authJwt from '../middlewares/authJwt'
import * as deliveryController from '../controllers/deliveryController'

const router = Router()

router.post('/api/calculate-delivery-price', authJwt.verifyToken, deliveryController.calculateDeliveryPrice)

export default router
