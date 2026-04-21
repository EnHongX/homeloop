import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'
import authMiddleware, { AuthRequest } from '../middleware/auth'

const router = Router()

const validateProductStatus = (status: string) => {
  const validStatuses = ['available', 'reserved', 'sold', 'offline']
  return validStatuses.includes(status) ? status : 'available'
}

const PUBLIC_STATUSES = ['available']

router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, status, isMyProducts } = req.query

    const where: any = {}

    if (userId) {
      where.userId = userId as string
    }

    if (isMyProducts) {
      if (userId) {
        where.userId = userId as string
      }
    } else {
      where.status = {
        in: PUBLIC_STATUSES,
      }
    }

    if (status && status !== 'all') {
      where.status = status as string
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            phone: true,
            nickname: true,
            avatar: true,
          },
        },
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

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
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
      quantity,
      deliveryMethod,
    } = body

    console.log('Received product data from user:', req.userId, {
      name,
      description,
      price,
      category,
      condition,
      location,
      contactInfo,
      images,
      quantity,
      deliveryMethod,
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

    const productStatus = validateProductStatus(status || 'available')

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
        status: productStatus,
        userId: req.userId,
        quantity: quantity !== undefined ? parseInt(quantity, 10) : 1,
        deliveryMethod: deliveryMethod || null,
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

router.get('/my', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query

    const where: any = {
      userId: req.userId,
    }

    if (status && status !== 'all') {
      where.status = status as string
    }

    const products = await prisma.product.findMany({
      where,
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
    console.error('Error fetching my products:', error)
    return res.status(500).json({
      success: false,
      error: '获取我的商品列表失败',
    })
  }
})

router.put('/batch/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { ids, status } = req.body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请选择要操作的商品',
      })
    }

    const validStatuses = ['available', 'reserved', 'sold', 'offline']
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: '无效的状态值',
      })
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        userId: true,
      },
    })

    const unauthorizedIds = products
      .filter(p => !p.userId || p.userId !== req.userId)
      .map(p => p.id)

    if (unauthorizedIds.length > 0) {
      return res.status(403).json({
        success: false,
        error: '您没有权限操作这些商品',
      })
    }

    const updatedProducts = await prisma.product.updateMany({
      where: {
        id: {
          in: ids,
        },
        userId: req.userId,
      },
      data: {
        status,
      },
    })

    return res.json({
      success: true,
      data: {
        count: updatedProducts.count,
      },
      message: '商品状态更新成功',
    })
  } catch (error) {
    console.error('Error updating batch status:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '批量更新失败',
    })
  }
})

router.delete('/batch', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请选择要删除的商品',
      })
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        userId: true,
      },
    })

    const unauthorizedIds = products
      .filter(p => !p.userId || p.userId !== req.userId)
      .map(p => p.id)

    if (unauthorizedIds.length > 0) {
      return res.status(403).json({
        success: false,
        error: '您没有权限删除这些商品',
      })
    }

    const deletedProducts = await prisma.product.deleteMany({
      where: {
        id: {
          in: ids,
        },
        userId: req.userId,
      },
    })

    return res.json({
      success: true,
      data: {
        count: deletedProducts.count,
      },
      message: '商品删除成功',
    })
  } catch (error) {
    console.error('Error deleting batch products:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '批量删除失败',
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
        user: {
          select: {
            id: true,
            phone: true,
            nickname: true,
            avatar: true,
          },
        },
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

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const body = req.body

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    })

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: '商品不存在',
      })
    }

    if (!existingProduct.userId || existingProduct.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: '您没有权限修改此商品',
      })
    }

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
      quantity,
      deliveryMethod,
    } = body

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
        error: '请至少保留一张商品图片',
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

    const productStatus = validateProductStatus(status || 'available')

    const updatedProduct = await prisma.product.update({
      where: { id },
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
        status: productStatus,
        quantity: quantity !== undefined ? parseInt(quantity, 10) : 1,
        deliveryMethod: deliveryMethod || null,
      },
      include: {
        category: true,
      },
    })

    return res.json({
      success: true,
      data: updatedProduct,
      message: '商品更新成功',
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '更新商品失败',
    })
  }
})

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
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

    if (!product.userId || product.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: '您没有权限删除此商品',
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
      error: error instanceof Error ? error.message : '删除商品失败',
    })
  }
})

export default router
