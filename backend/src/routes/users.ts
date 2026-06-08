import { Router } from 'express'
import { body } from 'express-validator'
import {
  getMe,
  updateMe,
  getMyPosts,
  getUserById,
  searchUsers,
} from '../controllers/userController'
import { authenticate } from '../middleware/authenticate'
import { validate } from '../middleware/validate'

const router = Router()

router.use(authenticate)

router.get('/me', getMe)
router.put(
  '/me',
  [body('bio').optional().isLength({ max: 160 }).withMessage('Bio max 160 characters.')],
  validate,
  updateMe
)
router.get('/me/posts', getMyPosts)
router.get('/search', searchUsers)
router.get('/:id', getUserById)

export default router
