import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return res.json({
      success: true,
      data: products,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return res.status(500).json({
      success: false,
      error: '获取商品列表失败',
    })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body
    
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

    console.log('Received product data:', {
      name,
      description,
      price,
      category,
      condition,
      location,
      contactInfo,
      images,
    })

    if (name == null || name === '' ||
        description == null || description === '' ||
        price == null ||
        category == null || category === '' ||
        condition == null || condition === '' ||
        location == null || location === '' ||
        contactInfo == null || contactInfo === '') {
      return res.status(400).json({
        success: false,
        error: '请填写所有必填字段',
      })
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请至少上传一张商品图片',
      })
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

    return res.json({
      success: true,
      data: product,
      message: '商品发布成功',
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '创建商品失败',
    })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        error: '商品不存在',
      })
    }

    await prisma.product.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    })

    return res.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return res.status(500).json({
      success: false,
      error: '获取商品详情失败',
    })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        error: '商品不存在',
      })
    }

    await prisma.product.delete({
      where: { id },
    })

    return res.json({
      success: true,
      message: '商品已删除',
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return res.status(500).json({
      success: false,
      error: '删除商品失败',
    })
  }
})

export default router
