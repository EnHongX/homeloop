import { NextRequest, NextResponse } from 'next/server'
import { uploadToOSS, UploadFolder } from '@/lib/oss'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'products'

    if (!file || file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '请选择要上传的文件',
        },
        { status: 400 }
      )
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: '只支持 JPG/PNG 格式的图片',
        },
        { status: 400 }
      )
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: '图片大小不能超过 5MB',
        },
        { status: 400 }
      )
    }

    const uploadFolder = folder === 'avatars' ? UploadFolder.AVATARS : UploadFolder.PRODUCTS
    
    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadToOSS(buffer, file.name, uploadFolder)

    return NextResponse.json({
      success: true,
      data: {
        url,
        name: file.name,
        size: file.size,
      },
      message: '上传成功',
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '上传失败',
      },
      { status: 500 }
    )
  }
}
