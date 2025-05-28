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
  public setRoute = () => {}
}
