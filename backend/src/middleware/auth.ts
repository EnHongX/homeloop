import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import redis from '../lib/redis'

const JWT_SECRET = process.env.JWT_SECRET || 'homeloop-jwt-secret-key'
const JWT_EXPIRE_DAYS = parseInt(process.env.JWT_EXPIRE_DAYS || '7', 10)

const getBlacklistKey = (token: string) => `jwt:blacklist:${token}`

export interface AuthRequest extends Request {
  userId?: string
  phone?: string
}

export function getTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    const key = getBlacklistKey(token)
    const result = await redis.get(key)
    return result !== null
  } catch (error) {
    console.error('[Redis] 检查token黑名单失败:', error)
    return false
  }
}

export async function blacklistToken(token: string, expireDays: number = JWT_EXPIRE_DAYS): Promise<void> {
  try {
    const key = getBlacklistKey(token)
    const expireSeconds = expireDays * 24 * 60 * 60
    await redis.setex(key, expireSeconds, 'blacklisted')
    console.log(`[Auth] Token已加入黑名单，有效期: ${expireSeconds}秒`)
  } catch (error) {
    console.error('[Redis] 添加token到黑名单失败:', error)
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = getTokenFromHeader(req)
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: '未登录，请先登录',
    })
  }

  isTokenBlacklisted(token)
    .then((isBlacklisted) => {
      if (isBlacklisted) {
        return res.status(401).json({
          success: false,
          error: '登录已过期，请重新登录',
        })
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; phone: string }
        req.userId = decoded.userId
        req.phone = decoded.phone
        next()
      } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
          return res.status(401).json({
            success: false,
            error: '登录已过期，请重新登录',
          })
        }
        return res.status(500).json({
          success: false,
          error: '认证失败',
        })
      }
    })
    .catch((error) => {
      console.error('[Auth] 认证中间件错误:', error)
      return res.status(500).json({
        success: false,
        error: '认证失败',
      })
    })
}

export default authMiddleware
