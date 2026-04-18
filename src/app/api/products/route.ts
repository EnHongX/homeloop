import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { uploadMultipleToOSS, UploadFolder } from '@/lib/oss'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: products,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      {
        success: false,
        error: '获取商品列表失败',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const originalPrice = formData.get('originalPrice') ? parseFloat(formData.get('originalPrice') as string) : null
    const category = formData.get('category') as string
    const condition = formData.get('condition') as string
    const location = formData.get('location') as string
    const contactInfo = formData.get('contactInfo') as string
    const status = (formData.get('status') as string) || 'available'

    const imageFiles = formData.getAll('images') as File[]
    
    let imageUrls: string[] = []
    
    if (imageFiles.length > 0 && imageFiles[0].size > 0) {
      const filesToUpload = await Promise.all(
        imageFiles.map(async (file) => ({
          buffer: Buffer.from(await file.arrayBuffer()),
          originalName: file.name,
        }))
      )
      
      imageUrls = await uploadMultipleToOSS(filesToUpload, UploadFolder.PRODUCTS)
    }

    let categoryRecord = await prisma.category.findUnique({
      where: { name: category },
    })

    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: { name: category },
      })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        originalPrice,
        categoryId: categoryRecord.id,
        condition,
        images: imageUrls,
        location,
        contactInfo,
        status,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: product,
      message: '商品发布成功',
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '创建商品失败',
      },
      { status: 500 }
    )
  }
}
