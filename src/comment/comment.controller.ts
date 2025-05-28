import { Hono } from 'hono'
import { every } from 'hono/combine'
import { zValidator } from '@hono/zod-validator'
import { UseAuth } from '../lib'
import { AppContextType } from '../types'
import { CommentService } from './comment.service'
import { newCommentInputSchema, paramIdSchema, paramPostIdSchema } from './dto'

export class CommentController {
  private commentService: CommentService
  private useAuth: UseAuth
  private app: Hono<{ Variables: AppContextType }>
  constructor() {
    this.commentService = new CommentService()
    this.useAuth = new UseAuth()
    this.app = new Hono()
  }
  public setRoute = () => {
    return this.app
      .get(
        '/:postId/',
        this.useAuth.getJwt,
        zValidator('param', paramPostIdSchema),
        async (c) => {
          const { postId } = c.req.valid('param')
          return await this.commentService.listComments(c, postId)
        }
      )
      .post(
        '/:postId/',
        every(this.useAuth.getJwt, this.useAuth.retrieveUserInfo),
        zValidator('param', paramPostIdSchema),
        zValidator('json', newCommentInputSchema),
        async (c) => {
          const user = c.get('currentUser')
          const { postId } = c.req.valid('param')
          const { text } = c.req.valid('json')
          return await this.commentService.createNewComment(
            c,
            postId,
            text,
            user
          )
        }
      )
      .delete(
        '/:id/',
        every(this.useAuth.getJwt, this.useAuth.retrieveUserInfo),
        zValidator('param', paramIdSchema),
        async (c) => {
          const user = c.get('currentUser')
          const { id } = c.req.valid('param')
          return await this.commentService.deleteComment(c, id, user)
        }
      )
      .post(
        '/:id/like/',
        every(this.useAuth.getJwt, this.useAuth.retrieveUserInfo),
        zValidator('param', paramIdSchema),
        async (c) => {
          const user = c.get('currentUser')
          const { id } = c.req.valid('param')
          return this.commentService.likeComment(c, id, user)
        }
      )
      .delete(
        '/:id/unlike/',
        every(this.useAuth.getJwt, this.useAuth.retrieveUserInfo),
        zValidator('param', paramIdSchema),
        async (c) => {
          const user = c.get('currentUser')
          const { id } = c.req.valid('param')
          return await this.commentService.unlikeComment(c, id, user)
        }
      )
  }
}
