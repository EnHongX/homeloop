import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'
import redis from '../lib/redis'
import jwt from 'jsonwebtoken'

const router = Router()

const SMS_VERIFICATION_CODE = process.env.SMS_VERIFICATION_CODE || '123456'
const SMS_CODE_EXPIRE_SECONDS = parseInt(process.env.SMS_CODE_EXPIRE_SECONDS || '300', 10)
const SMS_CODE_SEND_LIMIT_PER_PHONE = parseInt(process.env.SMS_CODE_SEND_LIMIT_PER_PHONE || '5', 10)
const SMS_CODE_SEND_LIMIT_WINDOW_SECONDS = parseInt(process.env.SMS_CODE_SEND_LIMIT_WINDOW_SECONDS || '3600', 10)
const JWT_SECRET = process.env.JWT_SECRET || 'homeloop-jwt-secret-key'
const JWT_EXPIRE_DAYS = parseInt(process.env.JWT_EXPIRE_DAYS || '7', 10)

const PHONE_REGEX = /^1[3-9]\d{9}$/

const getCodeKey = (phone: string) => `sms:code:${phone}`
const getSendCountKey = (phone: string) => `sms:count:${phone}`

function validatePhone(phone: string): boolean {
  return PHONE_REGEX.test(phone)
}

router.post('/send-code', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body

    if (!phone || !validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        error: '请输入正确的手机号码',
      })
    }

    console.log(`[SMS] 收到发送验证码请求: ${phone}`)

    try {
      const sendCountKey = getSendCountKey(phone)
      const currentCount = await redis.get(sendCountKey)
      const count = currentCount ? parseInt(currentCount, 10) : 0

      if (count >= SMS_CODE_SEND_LIMIT_PER_PHONE) {
        const ttl = await redis.ttl(sendCountKey)
        return res.status(429).json({
          success: false,
          error: `发送次数已达上限，请在 ${Math.ceil(ttl / 60)} 分钟后再试`,
        })
      }

      const codeKey = getCodeKey(phone)
      const existingCode = await redis.get(codeKey)
      if (existingCode) {
        const ttl = await redis.ttl(codeKey)
        if (ttl > SMS_CODE_EXPIRE_SECONDS - 60) {
          return res.status(429).json({
            success: false,
            error: `验证码发送过于频繁，请在 ${Math.ceil(ttl - (SMS_CODE_EXPIRE_SECONDS - 60))} 秒后再试`,
          })
        }
      }

      await redis.setex(codeKey, SMS_CODE_EXPIRE_SECONDS, SMS_VERIFICATION_CODE)

      const newCount = count + 1
      if (count === 0) {
        await redis.setex(sendCountKey, SMS_CODE_SEND_LIMIT_WINDOW_SECONDS, newCount.toString())
      } else {
        await redis.set(sendCountKey, newCount.toString(), 'KEEPTTL')
      }

      console.log(`[SMS] 验证码已存储到 Redis: phone=${phone}, code=${SMS_VERIFICATION_CODE}`)
    } catch (redisError) {
      console.error('[Redis] Redis 操作失败:', redisError)
      return res.status(500).json({
        success: false,
        error: '服务连接失败，请确保 Redis 服务已启动。测试环境下验证码为: ' + SMS_VERIFICATION_CODE,
      })
    }

    return res.json({
      success: true,
      message: `验证码已发送，测试验证码为: ${SMS_VERIFICATION_CODE}（有效期 ${SMS_CODE_EXPIRE_SECONDS} 秒）`,
      expireSeconds: SMS_CODE_EXPIRE_SECONDS,
      testCode: SMS_VERIFICATION_CODE,
    })
  } catch (error) {
    console.error('Error sending verification code:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '发送验证码失败',
    })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body

    console.log(`[Login] 收到登录请求: phone=${phone}`)

    if (!phone || !validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        error: '请输入正确的手机号码',
      })
    }

    if (!code || code.length !== 6) {
      return res.status(400).json({
        success: false,
        error: '请输入6位验证码',
      })
    }

    let storedCode: string | null = null
    try {
      const codeKey = getCodeKey(phone)
      storedCode = await redis.get(codeKey)
      console.log(`[Login] Redis 中验证码: phone=${phone}, storedCode=${storedCode}, inputCode=${code}`)
    } catch (redisError) {
      console.error('[Redis] 登录时读取验证码失败:', redisError)
      return res.status(500).json({
        success: false,
        error: `服务连接失败，请确保 Redis 服务已启动。测试验证码为: ${SMS_VERIFICATION_CODE}`,
      })
    }

    if (!storedCode) {
      return res.status(400).json({
        success: false,
        error: `验证码已过期或不存在。请先点击"获取验证码"。测试验证码为: ${SMS_VERIFICATION_CODE}`,
      })
    }

    if (storedCode !== code) {
      return res.status(400).json({
        success: false,
        error: `验证码错误。当前测试验证码为: ${SMS_VERIFICATION_CODE}`,
      })
    }

    try {
      const codeKey = getCodeKey(phone)
      await redis.del(codeKey)
    } catch (e) {
      console.warn('[Redis] 删除验证码失败:', e)
    }

    let user = await prisma.user.findUnique({
      where: { phone },
    })

    let isNewUser = false
    if (!user) {
      console.log(`[Login] 用户不存在，自动创建: phone=${phone}`)
      user = await prisma.user.create({
        data: {
          phone,
          nickname: `用户${phone.slice(-4)}`,
        },
      })
      isNewUser = true
    }

    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
      },
      JWT_SECRET,
      {
        expiresIn: `${JWT_EXPIRE_DAYS}d`,
      }
    )

    console.log(`[Login] 登录成功: phone=${phone}, isNewUser=${isNewUser}`)

    return res.json({
      success: true,
      message: isNewUser ? '注册并登录成功' : '登录成功',
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
        token,
        isNewUser,
      },
    })
  } catch (error) {
    console.error('Error logging in:', error)
    return res.status(500).json({
      success: false,
      error: '登录失败',
    })
  }
})

router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: '未登录',
      })
    }

    const token = authHeader.slice(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; phone: string }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: '用户不存在',
      })
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Error getting current user:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: '登录已过期，请重新登录',
      })
    }
    return res.status(500).json({
      success: false,
      error: '获取用户信息失败',
    })
  }
})

export default router
