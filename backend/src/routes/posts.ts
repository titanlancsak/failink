import { Router } from 'express'
import { body } from 'express-validator'
import {
  getFeed,
  createPost,
  deletePost,
  likePost,
  unlikePost,
  getComments,
  createComment,
} from '../controllers/postController'
import { authenticate } from '../middleware/authenticate'
import { validate } from '../middleware/validate'

const router = Router()

router.use(authenticate)

router.get('/', getFeed)

router.post(
  '/',
  [
    body('content')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Post must be 1–500 characters.'),
  ],
  validate,
  createPost
)

router.delete('/:id', deletePost)

router.post('/:id/like', likePost)
router.delete('/:id/like', unlikePost)

router.get('/:id/comments', getComments)

router.post(
  '/:id/comments',
  [
    body('content')
      .trim()
      .isLength({ min: 1, max: 300 })
      .withMessage('Comment must be 1–300 characters.'),
  ],
  validate,
  createComment
)

export default router
