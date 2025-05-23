import { Hono } from 'hono'
import { every } from 'hono/combine'
import { zValidator } from '@hono/zod-validator'
import { validator } from 'hono/validator'
import { UseAuth } from '../lib'
import { AppContextType } from '../types'
import { PostService } from './post.service'
import { postIdParamSchema } from './dto'

export class PostController {
  private postService: PostService
  private useAuth: UseAuth
  private app: Hono<{ Variables: AppContextType }>
  constructor() {
    this.postService = new PostService()
    this.useAuth = new UseAuth()
    this.app = new Hono()
  }
  public setRoute = () => {
    return this.app
      .get('/', this.useAuth.getJwt, async (c) => {
        return await this.postService.getPostList(c)
      })
      .post(
        '/',
        every(this.useAuth.getJwt, this.useAuth.retrieveUserInfo),
        validator('form', (value, c) => {
          const image = value['image']
          const text = value['text']
          if (typeof image === 'string')
            throw c.json({ message: 'Invalid type' }, 400)
          if ('type' in image === false)
            throw c.json({ message: 'Invalid type' }, 400)
          if (typeof text !== 'string')
            throw c.json({ message: 'Invalid type' }, 400)
          return { image, text }
        }),
        async (c) => {
          const body = c.req.valid('form')
          const user = c.get('currentUser')
          return await this.postService.createPost(c, user, body)
        }
      )
      .get(
        '/:id/',
        this.useAuth.getJwt,
        zValidator('param', postIdParamSchema),
        async (c) => {
          const { id } = c.req.valid('param')
          return await this.postService.getPostDetail(c, id)
        }
      )
      .delete(
        '/:id/',
        every(this.useAuth.getJwt, this.useAuth.retrieveUserInfo),
        zValidator('param', postIdParamSchema),
        async (c) => {
          const { id } = c.req.valid('param')
          const user = c.get('currentUser')
          return await this.postService.deletePost(c, user, id)
        }
      )
      .post(
        '/:id/like/',
        every(this.useAuth.getJwt, this.useAuth.retrieveUserInfo),
        zValidator('param', postIdParamSchema),
        async (c) => {
          const { id } = c.req.valid('param')
          const user = c.get('currentUser')
          return await this.postService.likePost(c, id, user)
        }
      )
      .delete(
        '/:id/unlike/',
        every(this.useAuth.getJwt, this.useAuth.retrieveUserInfo),
        zValidator('param', postIdParamSchema),
        async (c) => {
          const { id } = c.req.valid('param')
          const user = c.get('currentUser')
          return await this.postService.unlikePost(c, id, user)
        }
      )
  }
}
