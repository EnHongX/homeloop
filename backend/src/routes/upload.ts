import { Router, Request, Response } from 'express'
import multer from 'multer'
import { uploadToOSS, UploadFolder } from '../lib/oss'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file
    const folder = (req.body.folder as string) || 'products'

    if (!file || file.size === 0) {
      return res.status(400).json({
        success: false,
        error: '请选择要上传的文件',
      })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: '只支持 JPG/PNG 格式的图片',
      })
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: '图片大小不能超过 5MB',
      })
    }

    const uploadFolder = folder === 'avatars' ? UploadFolder.AVATARS : UploadFolder.PRODUCTS
    
    const url = await uploadToOSS(file.buffer, file.originalname, uploadFolder)

    return res.json({
      success: true,
      data: {
        url,
        name: file.originalname,
        size: file.size,
      },
      message: '上传成功',
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '上传失败',
    })
  }
})

export default router
