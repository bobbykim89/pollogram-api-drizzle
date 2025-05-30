import { v2 as cloudinary } from 'cloudinary'
import { UseConfig } from './useConfig.composable'
import { encodeBase64 } from 'hono/utils/encode'
import { type Context } from 'hono'

export class UseMultipartData {
  private cloudinarySdk: typeof cloudinary
  private config: UseConfig
  constructor() {
    this.cloudinarySdk = cloudinary
    this.config = new UseConfig()
    this.cloudinarySdk.config({
      cloud_name: this.config.cloudinaryCloudName,
      api_key: this.config.cloudinaryApiKey,
      api_secret: this.config.cloudinaryApiSecret,
    })
  }
  public uploadCloudinary = async (
    ctx: Context,
    arg: string | File,
    folder: string
  ) => {
    try {
      if (!arg || !(arg instanceof File) || arg.size === 0)
        throw ctx.json({ message: 'Invalid file ' })
      const allowedType: string[] = ['image/jpeg', 'image/png', 'image/webp']
      if (allowedType.includes(arg.type) === false)
        throw ctx.json({ message: 'Not acceptable' }, 406)
      const bytearrayBuffer = await arg.arrayBuffer()
      const base64Encoded = encodeBase64(bytearrayBuffer)
      const dataUrl = `data:${arg.type};base64,${base64Encoded}`
      const { public_id } = await this.cloudinarySdk.uploader.upload(dataUrl, {
        folder: `${this.config.cloudinaryTargetFolder}/${folder}`,
        resource_type: 'image',
        allowed_formats: ['jpg', 'png', 'webp'],
      })
      return { image_id: public_id }
    } catch (error) {
      console.error(error)
      throw ctx.json({ message: 'Failed to upload file to cloudinary' }, 500)
    }
  }
  public deleteCloudinaryImage = async (id: string) => {
    await this.cloudinarySdk.uploader.destroy(id)
  }
}
