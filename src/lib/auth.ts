'use client'

import { API_ENDPOINTS } from './api'

export interface User {
  id: string
  phone: string
  nickname: string | null
  avatar: string | null
  createdAt: string
}

export interface LoginResult {
  user: User
  token: string
  isNewUser: boolean
}

const TOKEN_KEY = 'homeloop_token'
const USER_KEY = 'homeloop_user'

export async function sendVerificationCode(phone: string): Promise<{
  success: boolean
  message: string
  expireSeconds?: number
  error?: string
}> {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH_SEND_CODE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    })

    const data = await response.json()
    return {
      success: data.success,
      message: data.message || '',
      expireSeconds: data.expireSeconds,
      error: data.error,
    }
  } catch (error) {
    return {
      success: false,
      message: '网络错误，请稍后重试',
      error: error instanceof Error ? error.message : '未知错误',
    }
  }
}

export async function loginWithCode(phone: string, code: string): Promise<{
  success: boolean
  message: string
  data?: LoginResult
  error?: string
}> {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, code }),
    })

    const data = await response.json()

    if (data.success && data.data) {
      localStorage.setItem(TOKEN_KEY, data.data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.data.user))
    }

    return {
      success: data.success,
      message: data.message || '',
      data: data.data,
      error: data.error,
    }
  } catch (error) {
    return {
      success: false,
      message: '网络错误，请稍后重试',
      error: error instanceof Error ? error.message : '未知错误',
    }
  }
}

export async function getCurrentUser(): Promise<{
  success: boolean
  user?: User
  error?: string
}> {
  const token = getToken()
  if (!token) {
    return {
      success: false,
      error: '未登录',
    }
  }

  try {
    const response = await fetch(API_ENDPOINTS.AUTH_ME, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (data.success && data.data) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.data))
    }

    return {
      success: data.success,
      user: data.data,
      error: data.error,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取用户信息失败',
    }
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem(USER_KEY)
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function logout(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isLoggedIn(): boolean {
  return !!getToken()
}
