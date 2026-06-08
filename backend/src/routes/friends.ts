import { Router } from 'express'
import { body } from 'express-validator'
import {
  getFriends,
  getPendingRequests,
  sendRequest,
  acceptRequest,
  rejectRequest,
  removeFriend,
} from '../controllers/friendController'
import { authenticate } from '../middleware/authenticate'
import { validate } from '../middleware/validate'

const router = Router()

router.use(authenticate)

router.get('/', getFriends)
router.get('/requests', getPendingRequests)

router.post(
  '/request',
  [body('receiverId').isInt({ min: 1 }).withMessage('Valid receiverId required.')],
  validate,
  sendRequest
)

router.put('/request/:id/accept', acceptRequest)
router.put('/request/:id/reject', rejectRequest)
router.delete('/:id', removeFriend)

export default router
