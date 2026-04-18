import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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
    const body = await request.json()
    
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      condition,
      location,
      contactInfo,
      status,
      images,
    } = body

    if (!name || !description || !price || !category || !condition || !location || !contactInfo) {
      return NextResponse.json(
        {
          success: false,
          error: '请填写所有必填字段',
        },
        { status: 400 }
      )
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '请至少上传一张商品图片',
        },
        { status: 400 }
      )
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
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        categoryId: categoryRecord.id,
        condition,
        images,
        location,
        contactInfo,
        status: status || 'available',
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
